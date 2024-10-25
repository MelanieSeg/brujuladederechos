import { useNavigate } from "react-router-dom"


const NoAutorizado = () => {

  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate("/resumen")
  }


  return (
    <div className="flex h-full w-full items-center justify-center flex-col">
      <p>No estás autorizado para acceder a este módulo de la aplicación</p>
      <button
        onClick={handleGoBack}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Volver
      </button>
    </div>
  )
}

export default NoAutorizado
