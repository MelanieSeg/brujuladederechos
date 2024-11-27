import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ResetPasswordSchema } from '../lib/validations/user'; // Usa el esquema existente
import api from '../services/axiosUserInstance';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../utils/ThemeContext';

const RestablecerContraseña = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get('token');
    
    if (!resetToken) {
      toast.error('Token de restablecimiento inválido');
      navigate('/login');
      return;
    }
    
    setToken(resetToken);
  }, [location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(ResetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/reset-password', {
        token,
        password: data.password
      });
      
      if (response.status === 200) {
        setApiSuccess('Contraseña restablecida exitosamente');
        reset();

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setApiError('Hubo un error al restablecer la contraseña. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Hubo un error al restablecer la contraseña. Inténtalo de nuevo.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full space-y-8 shadow-lg rounded-lg p-8 
        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold 
            ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Restablecer contraseña
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
            <label 
                className={`block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nueva contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                className={`block w-full rounded-md border p-2 
                  ${isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white text-gray-900 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                placeholder="Nueva contraseña"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label 
                className={`block text-sm font-medium mb-1 
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Confirmar Nueva Contraseña
              </label>
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                className={`block w-full rounded-md border p-2 
                  ${isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white text-gray-900 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                placeholder="Confirmar Nueva Contraseña"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {apiError && (
            <p className="text-red-500 text-sm mt-2">{apiError}</p>
          )}
          {apiSuccess && (
            <p className="text-green-500 text-sm mt-2">{apiSuccess}</p>
          )}
  
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-blue-700 text-white hover:bg-blue-600' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
          </div>
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

export default RestablecerContraseña;