import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { changePasswordSchema } from "../../lib/validations/user";
import userApi from "../../services/axiosUserInstance";


export default function FormChangeUserPassword({ logoutFn }) {
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const navigate = useNavigate()


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await userApi.patch('/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.status === 200) {
        setApiSuccess('La contraseña ha sido actualizada exitosamente.');
        reset();

        setTimeout(async () => {
          await logoutFn();
          navigate("/login")
        }, 2000)

      } else {
        setApiError('Hubo un error al actualizar la contraseña. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error(err);
      setApiError('Hubo un error al actualizar la contraseña. Inténtalo de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="block mb-1">Contraseña Actual:</label>
        <input
          type="password"
          {...register('currentPassword')}
          placeholder="Contraseña Actual"
          className={`w-full px-3 py-2 border rounded-md ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors.currentPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Nueva Contraseña:</label>
        <input
          type="password"
          {...register('newPassword')}
          placeholder="Nueva Contraseña"
          className={`w-full px-3 py-2 border rounded-md ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors.newPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Confirmar Nueva Contraseña:</label>
        <input
          type="password"
          {...register('confirmNewPassword')}
          placeholder="Confirmar Nueva Contraseña"
          className={`w-full px-3 py-2 border rounded-md ${errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors.confirmNewPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      {apiError && (
        <p className="text-red-500 text-sm mt-2">{apiError}</p>
      )}
      {apiSuccess && (
        <p className="text-green-500 text-sm mt-2">{apiSuccess}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
      </button>
    </form>
  );
}