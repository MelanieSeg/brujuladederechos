import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/20/solid';

export default function ComentariosRecolectados() {
    const [comentarios] = useState([
        { comentario: 'No me gustó mucho', gravedad: 'Pendiente', sitio: 'latercera.com', fecha: 'Jul 4, 2024' },
        { comentario: 'Podría ser mejor.', gravedad: 'Clasificado', sitio: 'latercera.com', fecha: 'Jul 4, 2024' },
        { comentario: 'No estoy satisfecho', gravedad: 'Pendiente', sitio: 'latercera.com', fecha: 'Jul 4, 2024' },
        // Añadir más comentarios según sea necesario
    ]);

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedGravedad, setSelectedGravedad] = useState({
        Pendiente: true,
        Clasificado: true,
    });
    const [selectedDate, setSelectedDate] = useState('');
    const dropdownRef = useRef(null);
    const gravedadButtonRef = useRef(null);
    const calendarRef = useRef(null);
    const calendarButtonRef = useRef(null);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                isDropdownOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                gravedadButtonRef.current &&
                !gravedadButtonRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
            if (
                isCalendarOpen &&
                calendarRef.current &&
                !calendarRef.current.contains(event.target) &&
                calendarButtonRef.current &&
                !calendarButtonRef.current.contains(event.target)
            ) {
                setIsCalendarOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen, isCalendarOpen]);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const handleGravedadClick = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const handleGravedadChange = (gravedad) => {
        setSelectedGravedad((prevState) => ({
            ...prevState,
            [gravedad]: !prevState[gravedad],
        }));
    };

    const limpiarSeleccion = () => {
        setSelectedGravedad({
            Pendiente: false,
            Clasificado: false,
        });
    };

    const getBadgeColor = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-gray-300 text-gray-800'; // Color más claro para Pendiente
            case 'Clasificado':
                return 'bg-gray-200 text-gray-800'; // Color más claro para Clasificado
            default:
                return 'bg-gray-500 text-white'; // Color predeterminado
        }
    };

    const toggleCalendar = () => {
        setIsCalendarOpen(!isCalendarOpen);
    };

    const handleDateClick = (day) => {
        const today = new Date();
        const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Obtiene el mes actual con ceros a la izquierda
        const year = today.getFullYear();
        setSelectedDate(`${day}/${month}/${year}`); // Formato: día/mes/año
        setIsCalendarOpen(false); // Cerrar calendario después de seleccionar la fecha
    };

    const renderCalendar = () => {
        const days = [];
        const today = new Date();
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        for (let i = 1; i <= monthEnd.getDate(); i++) {
            days.push(i);
        }

        return (
            <div ref={calendarRef} className="absolute mt-2 bg-white p-4 rounded shadow-lg z-10 w-64">
                <div className="text-center font-bold mb-2">{today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}</div>
                <div className="grid grid-cols-7 gap-2">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day, index) => (
                        <div key={index} className="text-gray-500 text-sm">{day}</div>
                    ))}
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`w-full p-2 rounded-full ${selectedDate === day
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-200 text-gray-800'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderDropdown = () => {
        return (
            <div ref={dropdownRef} className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 font-semibold">Prioridad</div>
                    <div className="px-4 py-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedGravedad.Pendiente}
                                onChange={() => handleGravedadChange('Pendiente')}
                                className="form-checkbox text-gray-500"
                            />
                            <span className="text-gray-700">Pendiente</span>
                        </label>
                    </div>
                    <div className="px-4 py-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedGravedad.Clasificado}
                                onChange={() => handleGravedadChange('Clasificado')}
                                className="form-checkbox text-gray-500"
                            />
                            <span className="text-gray-700">Clasificado</span>
                        </label>
                    </div>
                    <div className="border-t border-gray-200">
                        <button onClick={limpiarSeleccion} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Limpiar</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 bg-[#FAF9F8] flex-1 relative">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Comentarios recolectados</h2>

            <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-4">
                    {/* Botón para abrir el calendario */}
                    <button
                        ref={calendarButtonRef}
                        onClick={toggleCalendar}
                        className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5 text-gray-500" />
                        <span>{selectedDate ? `Fecha: ${selectedDate}` : 'Fecha'}</span>
                    </button>
                    {isCalendarOpen && renderCalendar()}

                    {/* Botón de Gravedad con Dropdown */}
                    <div className="relative">
                        <button ref={gravedadButtonRef} onClick={handleGravedadClick} className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm">
                            <PlusIcon className="w-5 h-5 text-gray-500" />
                            <span>Gravedad</span>
                        </button>
                        {isDropdownOpen && renderDropdown()}
                    </div>
                </div>

                {/* Inputs de fecha y botón Descargar */}
                <div className="flex items-center space-x-4">
                    <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 bg-white"
                    />
                    <span>-</span>
                    <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 bg-white"
                    />
                    <button className="bg-black text-white px-4 py-2 rounded-md">Descargar</button>
                </div>
            </div>

            <table className="min-w-full bg-white shadow-md rounded-lg border-collapse">
                <thead>
                    <tr>
                        <th className="px-6 py-4 text-left font-medium text-gray-500">Comentario</th>
                        <th className="px-12 py-4 text-left font-medium text-gray-500">Gravedad</th>
                        <th className="px-6 py-4 text-left font-medium text-gray-500">Sitio Web</th>
                        <th className="px-6 py-4 text-left font-medium text-gray-500">Fecha</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {comentarios.map((comentario, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="px-6 py-4">{comentario.comentario}</td>
                            <td className="px-12 py-4">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(comentario.gravedad)}`}>
                                    {comentario.gravedad}
                                </span>
                            </td>
                            <td className="px-6 py-4">{comentario.sitio}</td>
                            <td className="px-6 py-4">{comentario.fecha}</td>
                            <td className="px-6 py-4 text-right">
                                <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
