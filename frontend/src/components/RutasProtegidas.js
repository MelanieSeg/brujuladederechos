import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";



const RutasProtegidas = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    //TODO: Agregar tailwindcss para hacer un Cargando mas acorde 
    return <div>Cargando... </div>
  }

  if (!user) {
    return <Navigate to={"/login"} />
  }


  return children ? children : <Outlet />
}


export default RutasProtegidas
