// src/components/Objects/Formulario.jsx

import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid'; // Importa el ícono de descarga correcto

const Formulario = ({ comentariosFiltrados, columns, formatData, fileName }) => {
  // Función para generar el PDF
  const generatePDF = (comentarios) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', margin: 40 });

    // Extraer los títulos de las columnas
    const tableColumn = columns.map(col => col.title);

    // Formatear los datos según la función proporcionada
    const tableRows = comentarios.map(formatData);

    // Configuración de autoTable
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { cellPadding: 5, fontSize: 10, overflow: "linebreak" },
      columnStyles: columns.reduce((acc, col, index) => {
        acc[index] = { cellWidth: col.width, halign: col.halign };
        return acc;
      }, {}),
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133], halign: "center" },
      bodyStyles: { valign: "top" },
      tableWidth: 'auto'
    });

    return doc;
  };

  // Manejar la descarga del PDF
  const handleDownloadPDF = () => {
    try {
      const pdfDoc = generatePDF(comentariosFiltrados);
      
      // Obtener la fecha y hora actuales
      const now = new Date();
      
      // Formatear la fecha y hora como "YYYY-MM-DD_HH-MM-SS"
      const formattedDate = format(now, 'yyyy-MM-dd_HH-mm-ss');
      
      // Generar el nuevo nombre de archivo insertando la fecha y hora
      const newFileName = fileName.replace('.pdf', `_${formattedDate}.pdf`);
      
      // Descargar el PDF con el nuevo nombre
      pdfDoc.save(newFileName);
    } catch (error) {
      console.error("Error al generar el PDF: ", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}//valor cambiado
      className="flex items-center justify-center bg-black text-white 
                 px-1 py-2 sm:px-4 sm:py-2 rounded-md 
                 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black 
                 transition-colors duration-200"
      aria-label="Descargar PDF"
    >
      {/* Texto del botón visible en pantallas medianas y grandes */}
      <span className="hidden sm:inline text-sm">Descargar PDF</span>
      
      {/* Ícono de descarga visible en pantallas pequeñas */}
      <ArrowDownTrayIcon className="w-5 h-5 sm:hidden" />
    </button>
  );
};

// Definición de PropTypes
Formulario.propTypes = {
  comentariosFiltrados: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
      halign: PropTypes.oneOf(['left', 'center', 'right']).isRequired,
    })
  ).isRequired,
  formatData: PropTypes.func.isRequired,
  fileName: PropTypes.string, // Nuevo prop para el nombre del archivo
};

// Valores por defecto para las props
Formulario.defaultProps = {
  fileName: "comentarios_pendientes.pdf",
};

export default Formulario;
