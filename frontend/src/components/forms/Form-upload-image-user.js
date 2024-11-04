import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { uploadImageSchema } from "../../lib/validations/uploadimage";
import userApi from "../../services/axiosUserInstance";


export default function FormChangeProfilePicture() {


  const { updateUser, user } = useAuth()
  const [apiError, setApiError] = useState(null);
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: yupResolver(uploadImageSchema)
  })



  const { errors } = formState;

  const onSubmit = async (data) => {
    try {
      console.log(data)
      const formData = new FormData()
      formData.append('image', data.image[0])
      const response = await userApi.post(`upload-image`, formData)
      console.log(response)
      if (response.status === 200) {
        setApiError(null);
        reset();

        const updatedUser = {
          ...user,
          image: response.data.url,
        };
        updateUser(updatedUser);
      } else {
        setApiError('Hubo un error al actualizar la foto de perfil. Inténtalo de nuevo.');
      }

      reset()
    } catch (err) {
      console.log(err)
    }

  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block mb-1">Seleccionar Imagen:</label>
        <input
          type="file"
          accept="image/*"
          {...register('image')}
          className="w-full"
        />
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {formState.isSubmitting ? 'Actualizando...' : 'Actualizar Foto'}
      </button>
    </form>
  )
}
