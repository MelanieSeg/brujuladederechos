import * as yup from 'yup'

export const loginSchema = yup.object().shape({
  email: yup.string().email("Correo electronico invalido").required("Requerido"),
  password: yup.string().min(6, "Minimo 6 caracteres").required("Requerido")
})

export const resetPasswordRequestSchema = yup.object().shape({
  email: yup.string()
    .email("Correo electrónico inválido")
    .required("El correo electrónico es requerido")
})

export const resetPasswordSchema = yup.object().shape({
  token: yup.string().required("El token es requerido"),
  newPassword: yup.string()
    .required("La nueva contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .matches(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .matches(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .matches(/[0-9]/, "La contraseña debe contener al menos un número")
    .matches(/[@$!%*?&#]/, "La contraseña debe contener al menos un carácter especial"),
  confirmNewPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], "Las contraseñas no coinciden")
    .required("Confirmar contraseña es requerido")
})
