import * as yup from 'yup'

export const loginSchema = yup.object().shape({
  email: yup.string().email("Correo electronico invalido").required("Requerido"),
  password: yup.string().min(6, "Minimo 6 caracteres").required("Requerido")
})
