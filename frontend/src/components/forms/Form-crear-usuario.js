import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'
import { userSchema } from '../../lib/validations/user';
import { useState } from 'react';
import userApi from '../../services/axiosUserInstance';

export default function FormCreateUser() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [moderadorAEliminar, setModeradorAEliminar] = useState(null);
  const [moderadorAEditar, setModeradorAEditar] = useState(null);

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

      console.log(payload)
      const response = await userApi.post('/create-user', payload); // Asegúrate de que la ruta es correcta
      console.log(response)

      //     onSuccess(response.data);

      reset();

      //   onClose();
    } catch (err) {
      console.log(err)
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
          Email
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="Email del moderador"
          className={`mt-1 p-2 w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          {...register('password')}
          placeholder="**********"
          className={`mt-1 p-2 w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Confirmar contraseña
        </label>
        <input
          type="password"
          {...register('confirmPassword')}
          placeholder="**********"
          className={`mt-1 p-2 w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Estado del moderador
        </label>
        <select
          {...register('isActive')}
          className={`mt-1 p-2 w-full border ${errors.rol ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value={true}>Activo</option>
          <option value={false}>Inactivo</option>
        </select>
        {errors.rol && (
          <p className="text-red-500 text-xs mt-1">{errors.rol.message}</p>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => {
            setMostrarFormulario(false);
            //           resetFormFields();
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
        </button>      </div>
    </form>

  )
}
