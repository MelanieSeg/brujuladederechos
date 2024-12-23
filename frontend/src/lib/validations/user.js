import * as yup from 'yup';

export const userSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(1, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),
  email: yup
    .string()
    .required('El correo electrónico es obligatorio')
    .email('Debe ser un correo electrónico válido'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/, 'La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&#]/, 'La contraseña debe contener al menos un carácter especial'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('La confirmación de contraseña es obligatoria'),
  isActive: yup
    .boolean()
    .required('El estado del moderador es obligatorio'),
});


const Roles = {
  MODERADOR: 'MODERADOR',
  ADMIN: 'ADMIN',
};

export const userUpdateSchema = yup.object().shape({
  name: yup.string()
    .min(1, "El nombre del usuario debe tener al menos un carácter")
    .max(72, "El nombre del usuario no puede exceder los 100 caracteres") // Cambié la cantidad según tu comentario
    .optional(),
  email: yup.string()
    .email("Debe proporcionar un email válido")
    .optional(),
  rol: yup.mixed()
    .oneOf(Object.values(Roles), "Rol inválido")
    .optional(),
  isActive: yup.boolean().optional(),
});


export const deleteUserConfirmSchema = yup.object().shape({
  justificacion: yup.string()
    .max(255, 'La justificación no puede exceder los 255 caracteres')
    .optional(),
})

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string()
    .required('La contraseña actual es requerida'),
  newPassword: yup.string()
    .required('La nueva contraseña es requerida')
    .min(6, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(24, 'La nueva contraseña no debe tener mas de 24 caracteres')
    .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/, 'La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&#]/, 'La contraseña debe contener al menos un carácter especial'),
  confirmNewPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Las contraseñas no coinciden')
    .required('Debes confirmar la nueva contraseña'),
});

export const ResetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(24, 'La contraseña no puede tener más de 24 caracteres')
    .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/, 'La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&#]/, 'La contraseña debe contener al menos un carácter especial')
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirmar contraseña es requerido')
});



