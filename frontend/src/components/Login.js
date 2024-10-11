// Login.js
import React, { useContext, useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { loginSchema } from '../lib/validations/login';
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'


export default function Login() {
  const { login, user } = useAuth()

  const navigate = useNavigate();


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: yupResolver(loginSchema)
  })


  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      navigate("/resumen")//cambiar esto quizas para que lleve al usuario a alguna tabla en especifico o simplemente a resumen
    } catch (err) {
      setError("password", {
        type: "manual",
        message: "Credenciales incorrectas, Intentalo otra vez"
      })

    }
  }




  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center justify-center">
          <LockClosedIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                {...register("email")}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 
                           text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 
                           sm:text-sm"
                placeholder="correo@ejemplo.com"
              />
              {errors.email && <p>{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                {...register("password")}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 
                           text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 
                           sm:text-sm"
                placeholder="********"
              />
              {errors.password && <p>{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium 
                         rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" />
              </span>
              Iniciar Sesión
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center mt-6">
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
