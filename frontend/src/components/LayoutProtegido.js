import { Outlet } from "react-router-dom";
import { useState } from "react";
import BarraLateral from "./BarraLateral";
import BarraDeNotificaciones from "./BarraDeNotificaciones";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const LayoutProtegido = ({ alternarNotificaciones, mostrarNotificaciones }) => {
  const [barraLateralVisible, setBarraLateralVisible] = useState(true);
  
  const toggleBarraLateral = () => {
    setBarraLateralVisible(!barraLateralVisible);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="fixed top-0 left-0 z-40 md:block hidden h-screen transition-all duration-300 ease-in-out">
        <BarraLateral 
          alternarNotificaciones={alternarNotificaciones} 
          collapsed={!barraLateralVisible}
        />
        <button 
          onClick={toggleBarraLateral} 
          className="absolute top-4 -right-4 bg-white shadow-md rounded-full p-1"
        >
          {barraLateralVisible ? (
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>
      
      <div
        className={`flex-1 transition-all duration-300 ease-in-out relative ${
          barraLateralVisible ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <div className="sticky top-0 right-0 z-50">
          {mostrarNotificaciones && <BarraDeNotificaciones />}
        </div>
        <Outlet />
      </div>
    </div>
  );
};
export default LayoutProtegido;