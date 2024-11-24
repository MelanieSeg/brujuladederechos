// RecuperarContraseña.js
import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordRequestSchema } from '../lib/validations/login';
import { resetPasswordRequest } from '../services/axiosAuthInstance';
import { ThemeContext } from '../utils/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function RecuperarContraseña() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(resetPasswordRequestSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await resetPasswordRequest(data.email);
      
      if (response.success) {
        // Navegar a la página de restablecer contraseña, 
        // pasando el correo electrónico como estado
        navigate('/reset-password', { 
          state: { 
            email: data.email 
          } 
        });
      } else {
        toast.error(response.message || 'No se pudo enviar el código de verificación');
      }
    } catch (error) {
      toast.error('Hubo un problema. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full shadow-lg rounded-lg p-8 
        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Recuperar Contraseña
        </h2>
        <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Ingresa tu correo electrónico para restablecer tu contraseña
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Correo Electrónico
            </label>
            <input
              type="email"
              {...register("email")}
              className={`mt-1 block w-full rounded-md border p-2 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              placeholder="tu-correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
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
            {isLoading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button 
            onClick={() => navigate('/login')}
            className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}