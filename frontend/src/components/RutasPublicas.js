import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RutasPublicas = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/resumen" replace />;
  }

  return children ? children : <Outlet />;
};

export default RutasPublicas;

