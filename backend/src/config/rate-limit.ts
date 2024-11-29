import { rateLimit } from 'express-rate-limit'

export const createUserLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,// por si acaso estos son 15 min
  max: 10,
  message: "Demasiadas solicitudes para crear usuarios desde esta IP, por favor intenta mas tarde"
})

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,// por si acaso estos son 15 min
  max: 5,
  message: "Demasiadas solicitudes para restablecimiento de password desde esta IP, por favor intenta mas tarde"
})

export const uploadImageLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,// por si acaso estos son 15 min
  max: 20,
  message: "Demasiadas solicitudes para restablecimiento de password desde esta IP, por favor intenta mas tarde"
})

export const changeUserConfigurationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,// por si acaso estos son 15 min
  max: 20,
  message: "Demasiadas solicitudes para intentar cambiar la configuracion de recoleccion de comentarios desde esta IP, por favor intenta mas tarde"
})



