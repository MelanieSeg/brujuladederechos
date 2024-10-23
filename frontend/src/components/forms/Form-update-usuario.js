import { useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'
import userApi from '../../services/axiosUserInstance';
import { userUpdateSchema } from "../../lib/validations/user";



export default function FormUpdateUser({ userData }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [apiError, setApiError] = useState(null);

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Nombre completo
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Nombre del moderador"
          className={`mt-1 p-2 w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>


      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Rol del moderador
        </label>
        <select
          {...register('rol')}
          className={`mt-1 p-2 w-full border ${errors.rol ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="MODERADOR">Moderador</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {errors.rol && (
          <p className="text-red-500 text-xs mt-1">{errors.rol.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Estado del moderador
        </label>
        <select
          {...register('isActive')}
          className={`mt-1 p-2 w-full border ${errors.isActive ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value={true}>Activo</option>
          <option value={false}>Inactivo</option>
        </select>
        {errors.isActive && (
          <p className="text-red-500 text-xs mt-1">{errors.isActive.message}</p>
        )}
      </div>

      {apiError && (
        <p className="text-red-500 text-xs mt-1">{apiError}</p>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => {
            setMostrarFormulario(false);
            reset();
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {isSubmitting ? 'Enviando...' : 'Completar'}
        </button>
      </div>
    </form>
  );
}
