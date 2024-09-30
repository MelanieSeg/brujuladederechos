import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, {
      message: "La contraseña tiene que ser de minimo 6 caracteres",
    })
    .max(24, {
      message: "La contraseña no puede superarar los 24 caracteres",
    }),
});
