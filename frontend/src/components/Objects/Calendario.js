import React, { useState, useContext } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { es } from "date-fns/locale";
import { ThemeContext } from '../../utils/ThemeContext';

function Calendario({ onDateSelect }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const { isDarkMode } = useContext(ThemeContext);
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
                        <div 
                            key={day} 
                            className={`py-1 text-center font-bold text-xs 
                                ${isDarkMode 
                                    ? 'text-gray-400' 
                                    : 'text-gray-500'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day.getDate())}
                            className={`py-1 rounded-md w-6 h-6 flex items-center justify-center text-xs 
                                ${isDarkMode 
                                    ? (selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                                        ? "bg-indigo-700 text-white" 
                                        : monthStart.getMonth() !== day.getMonth()
                                            ? "text-gray-600" 
                                            : "text-gray-200 hover:bg-gray-700 hover:text-white")
                                    : (selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                                        ? "bg-black text-white" 
                                        : monthStart.getMonth() !== day.getMonth()
                                            ? "text-gray-300" 
                                            : "text-black hover:bg-black hover:text-white")
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
        <div 
            className={`p-2 rounded-lg shadow-xl w-48 z-10 
                ${isDarkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white'
                }`}
        >
            <div className="flex justify-between items-center mb-2">
                <button 
                    onClick={() => setCurrentDate(addMonths(currentDate, -1))} 
                    className={`p-1 rounded-md 
                        ${isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span 
                    className={`font-bold text-sm 
                        ${isDarkMode 
                            ? 'text-gray-200' 
                            : 'text-black'
                        }`}
                >
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button 
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))} 
                    className={`p-1 rounded-md 
                        ${isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
            {renderDays()}
        </div>
    );
}

export default Calendario;