// src/components/Objects/Calendario.js

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import { es } from "date-fns/locale"; // Español

// DatePicker Component
const DatePicker = ({ selectedDate, onDateChange, placeholder, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date())
  );
  const calendarRef = useRef(null);

  // Close the calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-2">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className={`p-1 rounded-md hover:bg-indigo-200 ${
          isDarkMode ? "hover:bg-gray-600" : ""
        }`}
      >
        <ChevronLeftIcon className="w-5 h-5 text-indigo-500" />
      </button>
      <div className="font-semibold text-center text-xs">
        {format(currentMonth, "MMMM yyyy", { locale: es })}
      </div>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className={`p-1 rounded-md hover:bg-indigo-200 ${
          isDarkMode ? "hover:bg-gray-600" : ""
        }`}
      >
        <ChevronRightIcon className="w-5 h-5 text-indigo-500" />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Week starts on Monday
    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className={`text-center text-xs font-medium ${
            isDarkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {format(addDays(startDate, i), "EEE", { locale: es })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat, { locale: es });
        const cloneDay = day;
        const isDisabled = !isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());

        days.push(
          <button
            type="button"
            key={day}
            onClick={() => {
              if (!isDisabled) {
                onDateChange(cloneDay);
                setIsOpen(false);
              }
            }}
            className={`py-1 w-full rounded-md text-xs
              ${
                isDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : `text-gray-700 dark:text-gray-300 hover:bg-indigo-200 dark:hover:bg-gray-600`
              }
              ${isSelected ? "bg-indigo-500 text-white" : ""}
              ${isToday && !isSelected ? "border border-indigo-500" : ""}
            `}
            disabled={isDisabled}
          >
            {formattedDate}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-1 mb-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="relative" ref={calendarRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 
          ${
            isDarkMode
              ? "bg-gray-800 text-white border-gray-700 focus:ring-indigo-500"
              : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500"
          }`}
      >
        {selectedDate ? (
          format(selectedDate, "dd-MM-yyyy", { locale: es })
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </button>
      {isOpen && (
        <div
          className={`absolute mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-4`}
          style={{ width: "200px" }} // Fixed width
        >
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      )}
    </div>
  );
};

// Calendario Component to be used in ComentariosPendientes.js
const Calendario = ({ onDateSelect, isDarkMode, placeholder }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <DatePicker
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      placeholder={placeholder}
      isDarkMode={isDarkMode}
    />
  );
};

export default Calendario;
export { DatePicker };
