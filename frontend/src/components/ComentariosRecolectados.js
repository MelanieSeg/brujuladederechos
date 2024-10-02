import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon, PlusIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';

export default function ComentariosRecolectados() {
    const [comentarios, setComentarios] = useState([
        { comentario: 'No me gustó mucho', gravedad: 'Pendiente', sitio: 'latercera.com', fecha: '2024-07-04' },
        { comentario: 'Podría ser mejor.', gravedad: 'Clasificado', sitio: 'latercera.com', fecha: '2024-07-04' },
        { comentario: 'No estoy satisfecho', gravedad: 'Pendiente', sitio: 'latercera.com', fecha: '2024-07-04' },
        { comentario: 'Este es el comentario 11', gravedad: 'Pendiente', sitio: 'example.com', fecha: '2024-07-04' },
        { comentario: 'Este es el comentario 12', gravedad: 'Clasificado', sitio: 'example.com', fecha: '2024-07-05' },
        { comentario: 'Este es el comentario 13', gravedad: 'Pendiente', sitio: 'example.com', fecha: '2024-07-06' },
        // ... (más comentarios)


        { comentario: 'No me gustó mucho', gravedad: 'Pendiente', sitio: 'latercera.com', fecha: 'Jul 4, 2024' },
        { comentario: 'Podría ser mejor.', gravedad: 'Clasificado', sitio: 'latercera.com', fecha: 'Jul 4, 2024' },
        { comentario: 'No estoy satisfecho', gravedad: 'Pendiente', sitio: 'latercera.com', fecha: 'Jul 4, 2024' },
        // Añadir más comentarios según sea necesario
        // ...
        { comentario: 'Este es el comentario 11', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 4, 2024' },
        { comentario: 'Este es el comentario 12', gravedad: 'Clasificado', sitio: 'example.com', fecha: 'Jul 5, 2024' },
        { comentario: 'Este es el comentario 13', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 6, 2024' },
        { comentario: 'Este es el comentario 11', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 4, 2024' },
        { comentario: 'Este es el comentario 12', gravedad: 'Clasificado', sitio: 'example.com', fecha: 'Jul 5, 2024' },
        { comentario: 'Este es el comentario 13', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 6, 2024' },
        { comentario: 'Este es el comentario 11', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 4, 2024' },
        { comentario: 'Este es el comentario 12', gravedad: 'Clasificado', sitio: 'example.com', fecha: 'Jul 5, 2024' },
        { comentario: 'Este es el comentario 13', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 6, 2024' },
        { comentario: 'Este es el comentario 11', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 4, 2024' },
        { comentario: 'Este es el comentario 12', gravedad: 'Clasificado', sitio: 'example.com', fecha: 'Jul 5, 2024' },
        { comentario: 'Este es el comentario 13', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 6, 2024' },
        { comentario: 'Este es el comentario 11', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 4, 2024' },
        { comentario: 'Este es el comentario 12', gravedad: 'Clasificado', sitio: 'example.com', fecha: 'Jul 5, 2024' },
        { comentario: 'Este es el comentario 13', gravedad: 'Pendiente', sitio: 'example.com', fecha: 'Jul 6, 2024' },
        // Puedes seguir añadiendo comentarios para hacer más pruebas
    ]);

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [selectedGravedad, setSelectedGravedad] = useState({
        Pendiente: true,
        Clasificado: true,
    });
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const commentsPerPage = 10;

    const dropdownRef = useRef(null);
    const gravedadButtonRef = useRef(null);
    const dateDropdownRef = useRef(null);
    const dateButtonRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target) && gravedadButtonRef.current && !gravedadButtonRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (isDateDropdownOpen && dateDropdownRef.current && !dateDropdownRef.current.contains(event.target) && dateButtonRef.current && !dateButtonRef.current.contains(event.target)) {
                setIsDateDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen, isDateDropdownOpen]);

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
            Pendiente: true,
            Clasificado: true,
        });
    };

    const getBadgeColor = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-gray-300 text-gray-800';
            case 'Clasificado':
                return 'bg-gray-200 text-gray-800';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const toggleDateDropdown = () => {
        setIsDateDropdownOpen(!isDateDropdownOpen);
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDateClick = (option) => {
        switch (option) {
            case 'Desde':
                const desdeDate = prompt('Ingrese la fecha desde (YYYY-MM-DD):');
                if (desdeDate) setFechaDesde(desdeDate);
                break;
            case 'Hasta':
                const hastaDate = prompt('Ingrese la fecha hasta (YYYY-MM-DD):');
                if (hastaDate) setFechaHasta(hastaDate);
                break;
            case 'Filtrar':
                // La filtración se realiza automáticamente en el cálculo de filteredComments
                break;
            case 'Eliminar Filtro':
                setFechaDesde('');
                setFechaHasta('');
                break;
        }
        setIsDateDropdownOpen(false);
    };

    const renderDateDropdown = () => {
        return (
            <div ref={dateDropdownRef} className="absolute mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                    <button onClick={() => handleDateClick('Desde')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Desde</button>
                    <button onClick={() => handleDateClick('Hasta')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hasta</button>
                    <button onClick={() => handleDateClick('Filtrar')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Filtrar</button>
                    <button onClick={() => handleDateClick('Eliminar Filtro')} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Eliminar Filtro</button>
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

    const filteredComments = comentarios.filter(comentario => {
        const gravedadMatch = selectedGravedad[comentario.gravedad];
        const dateMatch = (!fechaDesde || comentario.fecha >= fechaDesde) && (!fechaHasta || comentario.fecha <= fechaHasta);
        return gravedadMatch && dateMatch;
    });

    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
    const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

    return (
        <div className="p-8 bg-[#FAF9F8] flex-1 relative">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Comentarios recolectados</h2>

            <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-4">
                    {/* Date button with dropdown */}
                    <div className="relative">
                        <button
                            ref={dateButtonRef}
                            onClick={toggleDateDropdown}
                            className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 text-gray-500" />
                            <span>Fecha</span>
                        </button>
                        {isDateDropdownOpen && renderDateDropdown()}
                    </div>

                    {/* Gravedad button with dropdown */}
                    <div className="relative">
                        <button ref={gravedadButtonRef} onClick={handleGravedadClick} className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm">
                            <PlusIcon className="w-5 h-5 text-gray-500" />
                            <span>Gravedad</span>
                        </button>
                        {isDropdownOpen && renderDropdown()}
                    </div>
                </div>

                {/* Date inputs and Download button */}
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
                    {currentComments.map((comentario, index) => (
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

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white hover:bg-gray-100 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-gray-500">
                        <ChevronLeftIcon className="w-4 h-4" />
                    </span>
                    <span>Anterior</span>
                </button>

                <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePageClick(num)}
                            className={`px-4 py-2 rounded-full ${num === currentPage ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white hover:bg-gray-100 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span>Siguiente</span>
                    <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-gray-500">
                        <ChevronRightIcon className="w-4 h-4" />
                    </span>
                </button>
            </div>
        </div>
    );
}