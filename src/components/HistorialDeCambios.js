import React from 'react';

export default function HistorialDeCambios() {
    const cambios = [
        { comentario: "Se añadió nueva funcionalidad.", sitio: "example.com", fecha: "2024-09-20", motivo: "Mejora", usuario: "Usuario1", detalles: "Se mejoró la interfaz." },
        { comentario: "Se corrigió un error en la carga.", sitio: "example2.com", fecha: "2024-09-19", motivo: "Corrección", usuario: "Usuario2", detalles: "Error en la carga de datos solucionado." },
        // Agrega más cambios según sea necesario
    ];

    return (
        <div className="p-8" >
            <h2 className="text-3xl font-bold my-8" > Historial de Cambios </h2>

            { /* Tabla de cambios */}
            < div className="mt-8 bg-white shadow-md p-6 rounded-lg" >
                <table className="min-w-full border-collapse" >
                    <thead>
                        <tr>
                            <th className="p-4 text-left" > Comentario </th>
                            <th className="p-4 text-left" > Sitio Web </th>
                            <th className="p-4 text-left" > Fecha de Modificación </th>
                            <th className="p-4 text-left" > Motivo de Modificación </th>
                            <th className="p-4 text-left" > Usuario </th>
                            <th className="p-4 text-left" > Detalles </th>
                        </tr>
                    </thead>
                    <tbody >
                        {cambios.map((cambio, index) => (<tr key={index} >
                            <td className="border-b py-4" > {cambio.comentario} </td>
                            <td className="border-b py-4" > {cambio.sitio} </td>
                            <td className="border-b py-4" > {cambio.fecha} </td>
                            <td className="border-b py-4" > {cambio.motivo} </td>
                            <td className="border-b py-4" > {cambio.usuario} </td>
                            <td className="border-b py-4" > {cambio.detalles} </td>
                        </tr>
                        ))
                        }
                    </tbody>
                </table >
            </div>
        </div>
    );
}