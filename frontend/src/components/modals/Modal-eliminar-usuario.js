
import { useForm } from 'react-hook-form';
import React, { useContext } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { deleteUserConfirmSchema } from '../../lib/validations/user';
import userApi from '../../services/axiosUserInstance';
import { ThemeContext } from '../../utils/ThemeContext';

export default function ModalEliminarModerador({
  isOpen,
  onClose,
  onDelete,
  moderador,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(deleteUserConfirmSchema),
  });

  const { isDarkMode } = useContext(ThemeContext);

  const onSubmit = async (data) => {
    try {
      console.log({ data })
      console.log({
        data: {
          userId: moderador.id,
          justificacion: data.justificacion
        }
      })
      const response = await userApi.patch("/delete-user", { userId: moderador.id, justificacion: data.justificacion })
      console.log(response)
      reset();
    } catch (error) {
      console.error('Error al eliminar el moderador:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`p-6 rounded-md shadow-lg max-w-sm w-full ${
          isDarkMode 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-gray-900'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 
            className={`text-lg font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}
          >
            ¿Estás seguro?
          </h3>
          <button onClick={onClose}>
            <XMarkIcon 
              className={`h-6 w-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`} 
            />
          </button>
        </div>
        <p 
          className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-900'
          }`}
        >
          Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta del moderador y sus datos de nuestros servidores.
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Justificación Opcional */}
          <div className="mb-4">
            <label 
              className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              ¿Por qué deseas eliminar a este usuario? (Opcional)
            </label>
            <input
              type="text"
              {...register('justificacion')}
              placeholder="Ingrese su justificación"
              className={`mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 ${
                errors.justificacion 
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
            {errors.justificacion && (
              <p className="text-red-500 text-xs mt-1">
                {errors.justificacion.message}
              </p>
            )}
          </div>
          {/* Botones */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                reset();
              }}
              className={`px-4 py-2 rounded-md ${
                isDarkMode
                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md ${
                isDarkMode
                  ? 'bg-red-700 text-white hover:bg-red-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
