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

  markGlobalNotificationAsRead = async (globalNotificaionId: string, userId: string) => {
    try {

      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      })

      if (!user) {
        return {
          success: false,
          msg: "Error, no se pudo realizar la accion"
        }
      }

      const markAsRead = await this.prisma.userNotifications.create({
        data: {
          notificationId: globalNotificaionId,
          userId: user.id,
          isRead: true,
        }
      })

      return {
        success: true,
        msg: "Se completo la accion de leer la notificacion con exito"
      }

    } catch (err) {
      return {
        success: false,
        msg: err
      }
    }
  }

}


export default NotificationsService;
