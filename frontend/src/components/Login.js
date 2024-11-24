import React, { useContext, useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { loginSchema } from '../lib/validations/login';
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'
import { ThemeContext } from '../utils/ThemeContext'; //


export default function Login() {
  const { login, user } = useAuth()
  const { isDarkMode } = useContext(ThemeContext);

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
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full shadow-lg rounded-lg p-8 
        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="flex items-center justify-center">
          <LockClosedIcon className={`h-12 w-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Iniciar Sesión
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className={`block text-sm font-medium 
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Correo Electrónico
              </label>
              <input
                type="email"
                {...register("email")}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border
                  ${isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-blue-500 focus:border-blue-500'}
                  rounded-t-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && <p className={`text-red-500 ${isDarkMode ? 'text-red-400' : ''}`}>{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Contraseña
              </label>
              <input
                type="password"
                {...register("password")}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border 
                  ${isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-blue-500 focus:border-blue-500'}
                  rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="********"
              />
              {errors.password && <p className={`text-red-500 ${isDarkMode ? 'text-red-400' : ''}`}>{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md
                ${isDarkMode 
                  ? 'bg-blue-700 text-white hover:bg-blue-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon className={`h-5 w-5
                    ${isDarkMode 
                      ? 'text-blue-300 group-hover:text-blue-200' 
                      : 'text-blue-500 group-hover:text-blue-400'}`} aria-hidden="true" />
              </span>
              Iniciar Sesión
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center mt-6">
          <div className="text-sm">
          <Link 
              to="/forgot-password" 
              className={`font-medium 
                ${isDarkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-500'}`}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
