// RestablecerContraseña.js
import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ThemeContext } from '../utils/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { verifyResetToken, resetPassword } from '../services/axiosAuthInstance';

export default function RestablecerContraseña() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para manejar el correo electrónico y la verificación
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si hay un correo electrónico pasado desde la página anterior
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Si no hay correo, redirigir a recuperar contraseña
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  // Esquema de validación para el código y la contraseña
  const verifyCodeSchema = yup.object().shape({
    verificationCode: yup.string()
      .required("El código de verificación es requerido")
      .length(6, "El código debe tener 6 dígitos"),
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
  });

  // Formulario para verificar código y restablecer contraseña
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(verifyCodeSchema)
  });

  // Manejar el restablecimiento de contraseña
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Primero verificar el código
      const verifyResponse = await verifyResetToken(email, data.verificationCode);
      if (verifyResponse.success) {
        // Si el código es válido, proceder a restablecer la contraseña
        const resetResponse = await resetPassword(verifyResponse.token, data.newPassword);
        
        if (resetResponse.success) {
          toast.success('Contraseña restablecida exitosamente');
          navigate('/login');
        } else {
          toast.error(resetResponse.message || 'No se pudo restablecer la contraseña');
        }
      } else {
        toast.error(verifyResponse.message || 'Código de verificación inválido');
      }
    } catch (error) {
      toast.error('Hubo un problema. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay correo electrónico, no mostrar el formulario
  if (!email) {
    return null;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full shadow-lg rounded-lg p-8 
        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Restablecer Contraseña
        </h2>
        <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Ingresa el código de verificación y tu nueva contraseña
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="verificationCode" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Código de Verificación
            </label>
            <input
              type="text"
              {...register("verificationCode")}
              className={`mt-1 block w-full rounded-md border p-2 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              placeholder="Ingresa el código de 6 dígitos"
              maxLength={6}
            />
            {errors.verificationCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.verificationCode.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Nueva Contraseña
            </label>
            <input
              type="password"
              {...register("newPassword")}
              className={`mt-1 block w-full rounded-md border p-2 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              placeholder="Nueva contraseña"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              {...register("confirmNewPassword")}
              className={`mt-1 block w-full rounded-md border p-2 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              placeholder="Confirmar nueva contraseña"
            />
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-md ${
              isDarkMode 
                ? 'bg-blue-700 text-white hover:bg-blue-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Código enviado a: {email}
          </p>
          <button 
            onClick={() => navigate('/forgot-password')}
            className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
            Cambiar correo electrónico
          </button>
        </div>
      </div>
    </div>
  );
}