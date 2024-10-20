import { Outlet } from "react-router-dom";
import BarraLateral from "./BarraLateral";
import BarraDeNotificaciones from "./BarraDeNotificaciones";

const LayoutProtegido = ({ alternarNotificaciones, mostrarNotificaciones }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="fixed top-0 left-0 z-40 w-64 md:block hidden h-screen">
        <BarraLateral alternarNotificaciones={alternarNotificaciones} />
      </div>

      <div className="md:hidden">
        <BarraLateral alternarNotificaciones={alternarNotificaciones} />
      </div>

      <div className="flex-1 md:ml-64">
        {mostrarNotificaciones && <BarraDeNotificaciones />}
        <Outlet />       </div>
    </div>
  );
};

export default LayoutProtegido;

