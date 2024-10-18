// src/Objects/Formulario.js

import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO, isValid } from 'date-fns';

const Formulario = ({ comentariosFiltrados }) => {
  // Función para formatear los datos de cada comentario
  const formatCommentData = (comentario) => {
    const comentarioTexto = comentario.comentario;
    const estado =
      comentario.estado === "PENDIENTE_CLASIFICACION" ? "Pendiente" : "Clasificado";
    const sitioWeb = comentario.sourceUrl;
    const fecha = isValid(parseISO(comentario.fechaScraping))
      ? format(parseISO(comentario.fechaScraping), "dd-MM-yyyy")
      : "Fecha Inválida";

    return [comentarioTexto, estado, sitioWeb, fecha];
  };

  // Función para generar el PDF
  const generatePDF = (comentarios) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', margin: 40 });
    const tableColumn = ["Comentario", "Estado", "Sitio Web", "Fecha de Clasificación"];
    const tableRows = comentarios.map(formatCommentData);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { cellPadding: 5, fontSize: 10, overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 200, halign: 'left' },      // Comentario: alineado a la izquierda
        1: { cellWidth: 60, halign: 'center' },     // Estado: alineado al centro
        2: { cellWidth: 120, halign: 'center' },      // Sitio Web: alineado a la izquierda
        3: { cellWidth: 140, halign: 'center' },     // Fecha de Clasificación: mayor ancho y alineado a la derecha
      },
      
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
      pdfDoc.save("comentarios_pendientes.pdf");
    } catch (error) {
      console.error("Error al generar el PDF: ", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="bg-black text-white px-4 py-2 rounded-md"
    >
      Descargar
    </button>
  );
};

export default Formulario;
