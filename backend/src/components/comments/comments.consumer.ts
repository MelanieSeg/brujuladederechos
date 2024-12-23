import { PrismaClient, TipoNotificacion, TipoNotificacionApp } from "@prisma/client";
import amqp, { Channel, Connection, ConsumeMessage } from "amqplib";
import dotenv from "dotenv";
import { cleanComment, parseFecha } from "../../utils";
import CommentsService from "./comments.services";
import NotificationsService from "../notifications/notifications.services";


dotenv.config()
const DEAD_LETTER_EXCHANGE = 'comentarios_dead_letter_exchange';
const DEAD_LETTER_ROUTING_KEY = 'dead_letter_routing_key';
const DEAD_LETTER_QUEUE = 'comentarios_dead_letter_queue';
const NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || "notificaciones_insert";

//TODO: MEJORAR COMENTARIOS PARA QUE SEA MAS FACIL DE ENTENDER PARA MIS COMPANEROS
class CommentsConsumer {
  private connection!: Connection;
  private channel!: Channel;
  private queue: string;
  private commentsService: CommentsService
  private notificationsService: NotificationsService
  private totalCommentsInsertCount: number = 0;
  private messagesInFlight: number = 0

  //Los parametros para el batching( para hacer el INSERT por lotes)
  private batchSize: number = 10;
  private batchInterval: number = 5000; //tiempo en ms para hacer el INSERT si no se alcanza el batchsize
  private messageBuffer: { comment: any; msg: ConsumeMessage }[] = []
  private batchTimer: NodeJS.Timeout | null = null;

  private notificationChannel!: Channel;


  constructor(commentsServices: CommentsService, notificationsService: NotificationsService) {
    this.queue = process.env.RABBITMQ_QUEUE || 'comentarios_scraping_queue';
    this.commentsService = commentsServices;
    this.notificationsService = notificationsService
  }


  connect = async () => {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672')
      this.channel = await this.connection.createChannel();

      const deadLetterQueue = `${this.queue}_dead`

      await this.channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', { durable: true });

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

      this.notificationChannel = await this.connection.createChannel();
      await this.notificationChannel.assertExchange('notifications_exchange', 'direct', { durable: true });
      await this.notificationChannel.assertQueue(NOTIFICATION_QUEUE, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'notificaciones_insert_dead',
          'x-dead-letter-routing-key': 'dead_letter_routing_key',
        },
      });
      await this.notificationChannel.bindQueue(NOTIFICATION_QUEUE, 'notifications_exchange', 'notifications');


      this.channel.prefetch(10);//Esto significa que procesa 10 mensaje a la vez por si acaso
      console.log(`[*] Esperando mensajes en la cola :${this.queue}`);

      this.channel.consume(this.queue, this.handleMessage.bind(this), { noAck: false });
    } catch (err) {
      console.log('Error al conectar rabbitMQ :', err)
      setTimeout(() => this.connect(), 5000);//esto es para voler a intentarlo despus de 5 segundos
    }
  }

  private handleMessage = async (msg: ConsumeMessage | null) => {
    if (msg) {
      const content = msg.content.toString();
      let comment: any;
      this.messagesInFlight++


      try {
        comment = JSON.parse(content)
      } catch (err) {
        console.log('Error al parsear el mensaje :', err);
        this.channel.nack(msg, false, false)
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
        msgs.forEach(msg => {
          this.channel.ack(msg)
          this.messagesInFlight--
        });
        console.log(`[x] Insertados ${comments.length} comentarios exitosamente.`);

        this.totalCommentsInsertCount += comments.length
        // Verificar si la cola está vacía
        const queueInfo = await this.channel.checkQueue(this.queue);
        if (this.messagesInFlight === 0 && queueInfo.messageCount === 0) {
          // Crear y publicar la notif
          const totalNotification = {
            tipo: "TOTAL_COMMENTS_INSERTED",
            totalComentarios: this.totalCommentsInsertCount,
            fecha: new Date().toISOString(),
          };
          await this.publishTotalNotification(totalNotification);

          // Resetear el el contador de cometnarios totales
          this.totalCommentsInsertCount = 0;

          await this.notificationsService.createGlobalNotification({
            message: `Se insertaron ${totalNotification.totalComentarios} comentarios exitosamente`,
            typeNotificationApp: TipoNotificacionApp.INSERT_COMENTARIOS,
            type: TipoNotificacion.GLOBAL
          })
        }

      } else {
        console.error(`Error al insertar comentarios: ${result.msg}`);
        msgs.forEach(msg => {
          this.channel.nack(msg, false, true);
          this.messagesInFlight--;
        });
      }
    } catch (err) {
      console.error('Error al insertar comentarios en la base de datos:', err);
      msgs.forEach(msg => this.channel.nack(msg, false, true));
    }
  };
  private publishTotalNotification = async (notification: any) => {
    try {
      const payload = Buffer.from(JSON.stringify(notification));
      this.notificationChannel.publish('notifications_exchange', 'notifications', payload);
      console.log(`Notificación total publicada: ${JSON.stringify(notification)}`);
    } catch (err) {
      console.error('Error al publicar notificación total:', err);
    }
  };

  close = async () => {
    await this.channel.close();
    await this.connection.close();
    await this.notificationChannel.close()
    await this.commentsService.close();
  }

}

export default CommentsConsumer;
