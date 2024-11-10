import amqp, { Channel, Connection, ConsumeMessage } from "amqplib";
import dotenv from "dotenv";
import { cleanComment, parseFecha } from "../../utils";
import { Server } from "socket.io";

const NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || "notificaciones_insert";
const DEAD_LETTER_EXCHANGE = "notificaciones_insert_dead";
const DEAD_LETTER_ROUTING_KEY = "dead_letter_routing_key";
const DEAD_LETTER_QUEUE = "notificaciones_insert_dead";


class NotificationsConsumer {
  private connection!: Connection;
  private channel!: Channel;
  private queue: string;
  private io: Server

  constructor(io: Server) {
    this.queue = process.env.RABBIT_NOTIFICATIONS_QUEUE || "notificaciones_insert"
    this.io = io
  }

  public connect = async () => {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
      this.channel = await this.connection.createChannel();

      // Declarar el exchange de notificaciones
      await this.channel.assertExchange('notifications_exchange', 'direct', { durable: true });

      // Declarar la cola de dead-letter
      await this.channel.assertExchange(DEAD_LETTER_EXCHANGE, "direct", { durable: true });
      await this.channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
      await this.channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, DEAD_LETTER_ROUTING_KEY);

      // Declarar la cola principal con configuración de dead-letter
      await this.channel.assertQueue(this.queue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": DEAD_LETTER_EXCHANGE,
          "x-dead-letter-routing-key": DEAD_LETTER_ROUTING_KEY,
        },
      });

      // Vincular la cola al exchange de notificaciones
      await this.channel.bindQueue(this.queue, 'notifications_exchange', 'notifications');

      console.log(`[*] Esperando mensajes en la cola: ${this.queue}`);

      // Consumir mensajes de la cola
      this.channel.consume(
        this.queue,
        this.handleMessage.bind(this),
        { noAck: false }
      );


    } catch (error) {
      console.error(`Error al conectar a RabbitMQ: ${error}`);
      setTimeout(this.connect, 5000); // Reintentar después de 5 segundos
    }
  };


  private handleMessage = async (msg: ConsumeMessage | null) => {
    if (msg) {
      const content = msg.content.toString()

      let notification: any;

      try {
        notification = JSON.parse(content)

      } catch (err) {
        console.log("Error al parser el mensaje : ", err);
        this.channel.nack(msg, false, false)//rechazar el mensage y no volver a reintentar
        return;
      }

      try {

        this.io.emit("nueva_notificacion", notification);
        console.log(`Notificaciones emitida con exito : ${content}`)

      } catch (err) {
        console.log("Error al emitir la notificacion :", err)
        this.channel.nack(msg, false, true)// esto si vuelve a reintantar
      }
    }
  }


  public close = async () => {
    await this.channel.close()
    await this.connection.close()
  }
}


export default NotificationsConsumer;

