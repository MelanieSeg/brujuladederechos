import { Prisma, Roles } from "@prisma/client";
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


export const userIdParamsSchema = z.object({
  id: z.string().uuid()
}).strict()

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre del usuario debe tener al menos un carácter" })
    .max(72, { message: "El nombre del usuario no puede exceder los 72 caracteres" })//CAMBIAR LA CANTIDAD
    .optional(),
  email: z
    .string()
    .email({ message: "Debe proporcionar un email válido" })
    .optional(),
  rol: z.nativeEnum(Roles).default(Roles.MODERADOR).optional(),
  isActive: z.boolean().optional(),
}).strict();
//export type UpdateUserDto = z.infer<typeof userUpdateSchema>
export type UpdateUserDto = z.infer<typeof userUpdateSchema>;
export type UserUpdateData = Partial<Prisma.UserUpdateInput>

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
