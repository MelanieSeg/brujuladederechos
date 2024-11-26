import { useEffect, useRef, useState, useContext } from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'
import userApi from '../../services/axiosUserInstance';
import { userUpdateSchema } from "../../lib/validations/user";
import { ThemeContext } from '../../utils/ThemeContext';



export default function FormUpdateUser({ userData }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(userUpdateSchema),
    defaultValues: {
      isActive: userData.isActive,
      rol: userData.rol,
      name: userData.name

    },
  });

  const onSubmit = async (data) => {
    try {
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
      );

      console.log(filteredData);
      const response = await userApi.patch(`update-user/id/${userData.id}`, filteredData);
      console.log(response);

      reset();
    } catch (err) {
      console.log(err);
      setApiError('Hubo un error al crear el usuario. Inténtalo de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="mb-4">
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Nombre completo
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Nombre del moderador"
          className={`border mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${
            errors.name 
              ? 'border-red-500' 
              : isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
          } ${
            isDarkMode 
              ? 'focus:ring-blue-600' 
              : 'focus:ring-blue-500'
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Rol del moderador
        </label>
        <select
          {...register('rol')}
          className={`border mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${
            errors.rol 
              ? 'border-red-500' 
              : isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
          } ${
            isDarkMode 
              ? 'focus:ring-blue-600' 
              : 'focus:ring-blue-500'
          }`}
        >
          <option value="MODERADOR">Moderador</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {errors.rol && (
          <p className="text-red-500 text-xs mt-1">{errors.rol.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Estado del moderador
        </label>
        <select
          {...register('isActive')}
          className={`border mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${
            errors.isActive 
              ? 'border-red-500' 
              : isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
          } ${
            isDarkMode 
              ? 'focus:ring-blue-600' 
              : 'focus:ring-blue-500'
          }`}
        >
          <option value={true}>Activo</option>
          <option value={false}>Inactivo</option>
        </select>
        {errors.isActive && (
          <p className="text-red-500 text-xs mt-1">{errors.isActive.message}</p>
        )}
      </div>

 {apiError && (
        <p className={`text-red-500 text-xs mt-1 ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
          {apiError}
        </p>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => {
            setMostrarFormulario(false);
            reset();
          }}
          className={`bg-red-600 text-white py-2 px-4 rounded w-[48%] ${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-red-500 text-white hover:bg-red-600'}`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-600 text-white py-2 px-4 rounded w-[48%] ${isDarkMode ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Enviando...' : 'Completar'}
        </button>
      </div>
    </form>
  );
}
