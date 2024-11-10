import { TipoNotificacion, TipoNotificacionApp } from '@prisma/client'
import * as z from 'zod'



export const globalNotificationSchema = z.object({
  message: z.string().min(1, {
    message: "Message no puede ser menor a 1 caracter"
  }).max(30),
  type: z.nativeEnum(TipoNotificacion).default(TipoNotificacion.GLOBAL),
  typeNotificationApp: z.nativeEnum(TipoNotificacionApp)
})


export type GlobalNotificationDto = z.infer<typeof globalNotificationSchema>




export const individualNotificationSchema = z.object({
  message: z.string().min(1, {
    message: "Message no puede ser menor a 1 caracter"
  }).max(30),
  type: z.nativeEnum(TipoNotificacion).default(TipoNotificacion.INDIVIDUAL),
  typeNotificationApp: z.nativeEnum(TipoNotificacionApp)
})


export type individualNotificationDto = z.infer<typeof individualNotificationSchema>

