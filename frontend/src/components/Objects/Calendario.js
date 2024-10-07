import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { es } from "date-fns/locale";

function Calendario({ onDateSelect }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Nombres de los meses en español
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const handleDateClick = (day) => {
        const selectedDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(selectedDay);
        onDateSelect(selectedDay);  // Llamamos a la función onDateSelect para enviar la fecha seleccionada
    };

    const renderDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: es });
        const endDate = endOfWeek(monthEnd, { locale: es });

        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

        return (
            <>
                <div className="grid grid-cols-7">
                    {dayNames.map(day => (
                        <div key={day} className="py-1 text-center font-bold text-gray-500 text-xs">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day.getDate())}
                            className={`py-1 rounded-md w-6 h-6 flex items-center justify-center text-xs ${  /* Reducimos el tamaño de los botones y la fuente */
                                selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                                    ? "bg-black text-white"
                                    : monthStart.getMonth() !== day.getMonth()
                                    ? "text-gray-300"
                                    : "text-black hover:bg-black hover:text-white"
                            }`}
                        >
                            {format(day, "d")}
                        </button>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="p-2 rounded-lg shadow-xl bg-white w-48 z-10"> {/* Reducimos el padding y el ancho del contenedor */}
            <div className="flex justify-between items-center mb-2">
                <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="p-1 bg-gray-200 hover:bg-gray-300 rounded-md">
                    <ChevronLeftIcon className="w-4 h-4" /> {/* Reducimos el tamaño del ícono */}
                </button>
                <span className="font-bold text-sm"> {/* Reducimos el tamaño de la fuente del mes */}
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 bg-gray-200 hover:bg-gray-300 rounded-md">
                    <ChevronRightIcon className="w-4 h-4" /> {/* Reducimos el tamaño del ícono */}
                </button>
            </div>
            {renderDays()}
        </div>
    );
}


export default Calendario;