import * as z from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "El nombre del usuario tiene que ser al menos un caracter",
    })
    .max(72),
  email: z.string().email(),
  password: z
    .string()
    .min(6, {
      message: "La contraseña tiene que ser de minimo 6 caracteres",
    })
    .max(24, {
      message: "La contraseña no puede superarar los 24 caracteres",
    }),
  rol: z.string().default("MODERADOR"),
});


//TODO:Completar esto 
export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "El nombre del usuario tiene que ser al menos un caracter",
    })
    .max(72),
  email: z.string().email(),
  password: z
    .string()
    .min(6, {
      message: "La contraseña tiene que ser de minimo 6 caracteres",
    })
    .max(24, {
      message: "La contraseña no puede superarar los 24 caracteres",
    }),
  rol: z.string().default("MODERADOR"),
});

export const userResetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, {
      message: "La contraseña tiene que ser de minimo 6 caracteres",
    })
    .max(24, {
      message: "La contraseña no puede superarar los 24 caracteres",
    }),
  token: z
    .string()
    .min(4, {
      message: "Token invalido",
    })
    .max(6, {
      message: "Token invalido",
    }),
});
