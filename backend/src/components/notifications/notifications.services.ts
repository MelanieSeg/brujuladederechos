import { PrismaClient, TipoNotificacion, TipoNotificacionApp } from "@prisma/client";
import { GlobalNotificationDto } from "../../schemas/notifications";



class NotificationsService {
  private readonly prisma: PrismaClient
  constructor() {
    this.prisma = new PrismaClient();
  }




  createGlobalNotification = async (globalNotificationDto: GlobalNotificationDto) => {
    try {

      const globalNotification = await this.prisma.notification.create({
        data: {
          message: globalNotificationDto.message,
          type: TipoNotificacion.GLOBAL,
          tipoNotificacionApp: globalNotificationDto.typeNotificationApp,
        }
      })


      return {
        success: 'Notificacion GLOBAL creada exitosamente',
      }

    } catch (err) {
      return {
        success: false,
        message: err
      }
    }
  }

}


export default NotificationsService;
