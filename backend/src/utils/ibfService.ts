interface Comentario {
    sensibilidadPrivacidad: number;
    tiempoDesdeEvento: number;
    empatiaPrivacidad: number;
    interesPublico: number;
    esPersonajePublico: boolean;
    origenHonesto: boolean;
    empatiaExpresion: number;
}

export function calcularIBF(comentario: Comentario): number {
    const V = 1; // Constante de vulnerabilidad

    const PR = comentario.sensibilidadPrivacidad;
    const T = comentario.tiempoDesdeEvento;
    const Ep = comentario.empatiaPrivacidad;
    const PI = comentario.interesPublico;
    const PF = comentario.esPersonajePublico ? 1 : 0;
    const OI = comentario.origenHonesto ? 1 : 0;
    const Ef = comentario.empatiaExpresion;

    const numerador = V + PR + T + Ep;
    const denominador = PI + PF + OI + Ef;

    if (denominador === 0) {
        throw new Error("El denominador no puede ser cero");
    }

    return numerador / denominador;
}

export function evaluarComentario(comentario: Comentario): { resultado: string; mensaje: string } {
    const IBF = calcularIBF(comentario);
    const umbralModeracion = 1;

    if (IBF > umbralModeracion) {
        return { resultado: "moderado", mensaje: "Comentario debe ser moderado." };
    } else {
        return { resultado: "aprobado", mensaje: "Comentario aprobado para publicación." };
    }
}