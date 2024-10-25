import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";



const RequiredRole = ({ children, requiredRole }) => {
  const { user } = useAuth()

  const location = useLocation()


  if (!user) {
    return <Navigate to={"/login"} />
  }

  if (user.rol !== requiredRole) {
    return <Navigate to={"/no-autorizado"} replace />
  }


  return children
}

export default RequiredRole;
