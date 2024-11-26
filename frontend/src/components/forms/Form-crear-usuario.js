import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'
import { userSchema } from '../../lib/validations/user';
import userApi from '../../services/axiosUserInstance';
import { ThemeContext } from '../../utils/ThemeContext';
import React, { useState, useContext } from 'react';

export default function FormCreateUser() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [moderadorAEliminar, setModeradorAEliminar] = useState(null);
  const [moderadorAEditar, setModeradorAEditar] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);

  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm({
    resolver: yupResolver(userSchema),
  })


  const onSubmit = async (data) => {
    try {

      const { confirmPassword, ...payload } = data

      const response = await userApi.post('/create-user', payload);

      console.log(response.data)


      reset();

      //   onClose();
    } catch (err) {
      console.log(err)
    }
  };


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
    >
      {/* Nombre Completo */}
      <div className="mb-4">
        <label
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
        >
          Nombre completo
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Nombre del moderador"
          className={`border mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${errors.name
            ? 'border-red-500 text-gray-900' // Borde rojo en caso de error
            : isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white text-gray-900'
        } ${isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'}`}
      />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
        >
          Email
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="Email del moderador"
          className={`border mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${errors.email
            ? 'border-red-500 text-gray-900'
            : isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white text-gray-900'
            } ${isDarkMode
              ? 'focus:ring-blue-600'
              : 'focus:ring-blue-500'
            }`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Contraseña */}
      <div className="mb-4">
        <label
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
        >
          Contraseña
        </label>
        <input
          type="password"
          {...register('password')}
          placeholder="**********"
          className={`border mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${errors.password
            ? 'border-red-500 text-gray-900' // Borde rojo en caso de error
            : isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white text-gray-900'
        } ${isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'}`}
      />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div className="mb-4">
        <label
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
        >
          Confirmar contraseña
        </label>
        <input
          type="password"
          {...register('confirmPassword')}
          placeholder="**********"
          className={`border mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${errors.confirmPassword
            ? 'border-red-500 text-gray-900'
            : isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white text-gray-900'
            } ${isDarkMode
              ? 'focus:ring-blue-600'
              : 'focus:ring-blue-500'
            }`}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Estado del Moderador */}
      <div className="mb-4">
        <label
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
        >
          Estado del moderador
        </label>
        <select
          {...register('isActive')}
          className={`border mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${errors.rol
            ? 'border-red-500 text-gray-900'
            : isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white text-gray-900'
            } ${isDarkMode
              ? 'focus:ring-blue-600'
              : 'focus:ring-blue-500'
            }`}
        >
          <option value={true}>Activo</option>
          <option value={false}>Inactivo</option>
        </select>
        {errors.rol && (
          <p className="text-red-500 text-xs mt-1">{errors.rol.message}</p>
        )}
      </div>

      {/* Error de API */}
      {apiError && (
        <div
          className={`p-3 rounded-md ${isDarkMode
            ? 'bg-red-900 text-red-200'
            : 'bg-red-100 text-red-800'
            }`}
        >
          {apiError}
        </div>
      )}

      {/* Botones */}
      <div className="flex mt-6 justify-between">
        <button
          type="button"
          className={`bg-red-600 text-white py-2 px-4 rounded w-[48%] ${isDarkMode
            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            : 'bg-red-500 text-white hover:bg-red-600'}`}
          onClick={() => setMostrarFormulario(false)}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-600 text-white py-2 px-4 rounded w-[48%] ${isDarkMode
            ? 'bg-blue-700 text-white hover:bg-blue-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Enviando...' : 'Completar'}
        </button>
      </div>
    </form>
  );
}
