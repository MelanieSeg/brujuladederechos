import { PrismaClient } from "@prisma/client";
import amqp,{ Channel, Connection, ConsumeMessage } from "amqplib";
import dotenv from "dotenv";
import { cleanComment, parseFecha } from "../../utils";
import CommentsService from "./comments.services";


dotenv.config()
const DEAD_LETTER_EXCHANGE = 'comentarios_scraping_queue_dead';
const DEAD_LETTER_ROUTING_KEY = 'dead_letter_routing_key';
const DEAD_LETTER_QUEUE = 'comentarios_scraping_queue_dead';


class CommentsConsumer{
  private connection!:Connection;
  private channel!:Channel;
  private queue:string;
  private commentsService:CommentsService
  
  //Los parametros para el batching( para hacer el INSERT por lotes)
  private batchSize :number =10;
  private batchInterval:number = 5000; //tiempo en ms para hacer el INSERT si no se alcanza el batchsize
  private messageBuffer:{comment:any;msg:ConsumeMessage}[]=[]
  private batchTimer: NodeJS.Timeout | null = null;


  constructor(commentsServices:CommentsService){
    this.queue = process.env.RABBIT_QUEUE || 'comentarios_scraping_queue';
    this.commentsService=commentsServices;
  }


  connect=async()=>{
    try{
      this.connection= await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672')
      this.channel = await this.connection.createChannel();

      const deadLetterQueue = `${this.queue}_dead`

      await this.channel.assertExchange(DEAD_LETTER_EXCHANGE,'direct',{durable:true});

      await this.channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });

      //esto es para vincular la cola dead-letter al exchange
      await this.channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, DEAD_LETTER_ROUTING_KEY);

      await this.channel.assertQueue(this.queue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE,
          'x-dead-letter-routing-key': DEAD_LETTER_ROUTING_KEY,
        },
      });

      this.channel.prefetch(10);//Esto significa que procesa 10 mensaje a la vez por si acaso
      console.log(`[*] Esperando mensajes en la cola :${this.queue}`);

      this.channel.consume(this.queue,this.handleMessage.bind(this),{noAck:false});
    }catch(err){
      console.log('Error al conectar rabbitMQ :',err)
      setTimeout(()=>this.connect(),5000);//esto es para voler a intentarlo despus de 5 segundos
    }
  }

  private handleMessage=async(msg:ConsumeMessage | null)=>{
    if(msg){
      const content = msg.content.toString();
      let comment:any;


      try{
        comment = JSON.parse(content)
      }catch(err){
        console.log('Error al parsear el mensaje :',err);
        this.channel.nack(msg,false,false)
        return;
      }

      this.messageBuffer.push({ comment, msg });

      if (this.messageBuffer.length >= this.batchSize) {
        if (this.batchTimer) {
          clearTimeout(this.batchTimer);
          this.batchTimer = null;
        }
        await this.processBatch();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(async () => {
          await this.processBatch();
        }, this.batchInterval);
      }


      // try{
      //   //TODO: agregar funcion de insertar comentarios en la base de datso
      //   const result = await this.commentsService.addComment([comment],comment.sourceUrl)

      //   if(result.success){
      //     this.channel.ack(msg);
      //     console.log(`[x] Comentario insertado : ${comment.id}`)
      //   }else{
      //     console.log(`Error al insertar comentario: ${result.msg}`)
      //     this.channel.nack(msg,false,true);//Reintentar mmensaje
      //   }
      // }catch(err){
      //   console.log('Error al insertar el comentario en la base de datos: ',err)
      //   this.channel.nack(msg,false,true)//se reintenta el comentario
      // }
    }
  }

  private processBatch = async () => {
    const buffer = [...this.messageBuffer];
    this.messageBuffer = [];
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const comments = buffer.map(item => item.comment);
    const msgs = buffer.map(item => item.msg);

    if (comments.length === 0) {
      return;
    }

    const webSiteName = comments[0].sourceUrl; // asumimos que todos los cometnarios del batch son del mismo sourceURL

    try {
      const result = await this.commentsService.addCommentsBatch(comments, webSiteName);

      if (result.success) {
        msgs.forEach(msg => this.channel.ack(msg));
        console.log(`[x] Insertados ${comments.length} comentarios exitosamente.`);
      } else {
        console.error(`Error al insertar comentarios: ${result.msg}`);
        msgs.forEach(msg => this.channel.nack(msg, false, true)); // reintentar
      }
    } catch (err) {
      console.error('Error al insertar comentarios en la base de datos:', err);
      msgs.forEach(msg => this.channel.nack(msg, false, true)); // reintentar
    }
  };

  close = async ()=>{
    await this.channel.close();
    await this.connection.close();
    await this.commentsService.close();
  }

}

export default CommentsConsumer;