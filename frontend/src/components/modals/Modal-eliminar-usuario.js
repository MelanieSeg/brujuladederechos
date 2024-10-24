
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { deleteUserConfirmSchema } from '../../lib/validations/user';

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

  const onSubmit = async (data) => {
    try {
      await onDelete(moderador.id, data);
      reset();
    } catch (error) {
      console.error('Error al eliminar el moderador:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">¿Estás seguro?</h3>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <p className="text-sm text-gray-900 mb-4">
          Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta del moderador y sus datos de nuestros servidores.
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Justificación Opcional */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              ¿Por qué deseas eliminar a este usuario? (Opcional)
            </label>
            <input
              type="text"
              {...register('justificacion')}
              placeholder="Ingrese su justificación"
              className={`mt-1 p-2 w-full border ${errors.justificacion ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.justificacion && (
              <p className="text-red-500 text-xs mt-1">
                {errors.justificacion.message}
              </p>
            )}
          </div>
          {/* Confirmación de Contraseña */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Confirme su contraseña
            </label>
            <input
              type="password"
              {...register('contrasena')}
              placeholder="********"
              className={`mt-1 p-2 w-full border ${errors.contrasena ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.contrasena && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contrasena.message}
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
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
