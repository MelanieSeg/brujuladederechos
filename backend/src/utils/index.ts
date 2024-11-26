import { ResultadoIBF } from "@prisma/client";
import crypto from "crypto";
import { z } from "zod";

export function generateRandomToken() {
  const randomPart = crypto.randomInt(10000, 100000);
  const timePart = new Date().getMilliseconds();
  const token = (randomPart + timePart).toString().slice(0, 6);
  return token;
}

export function sliceSourceUrl(sourceUrl: string) { }

export function parseFecha(fecha: number | string): Date | null {
  let date: Date;

  if (typeof fecha === "number") {
    date = new Date(fecha);
  } else if (typeof fecha === "string") {
    // Parse the string to a number
    const timestamp = parseInt(fecha, 10);
    if (isNaN(timestamp)) {
      console.warn(`Fecha inválida: ${fecha}`);
      return null;
    }
    date = new Date(timestamp);
  } else {
    console.warn(`Formato de fecha desconocido: ${fecha}`);
    return null;
  }

  if (isNaN(date.getTime())) {
    console.warn(`Fecha inválida: ${fecha}`);
    return null;
  }

  return date;
}

export function cleanComment(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}


export function formatErrors(errors: z.ZodIssue[]) {
  return errors.map((error) => ({
    field: error.path.join("."),
    message: error.message,
  }));
};



const getFormattedDate = (): string => {
  const now = new Date();

  const pad = (n: number): string => n.toString().padStart(2, '0');
  const padMilliseconds = (n: number): string => n.toString().padStart(3, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const milliseconds = padMilliseconds(now.getMilliseconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const calculateIBF = (
  intensidadPrivacidad: number,
  elementoTiempo: number,
  empatiaPrivacidad: number,
  interesPublico: number,
  caracterPersonaPublico: number,
  origenInformacion: number
): { ibfScore: number; resultadoIbf: ResultadoIBF; empatiaExpresion: number; aprobadoPorModelo: boolean } => {
  const V = 1;
  const E_expresion = 1 - empatiaPrivacidad;

  const numerador = V + intensidadPrivacidad + elementoTiempo + empatiaPrivacidad;
  const denominador = interesPublico + caracterPersonaPublico - origenInformacion + E_expresion;

  const ibfScore = numerador / denominador;

  let resultadoIbf: ResultadoIBF;
  if (ibfScore > 1) {
    resultadoIbf = ResultadoIBF.PRIVACIDAD_PREDOMINA;
  } else if (ibfScore < 1) {
    resultadoIbf = ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA;
  } else {
    resultadoIbf = ResultadoIBF.EQUILIBRIO_ENTRE_DERECHOS;
  }

  const aprobadoPorModelo = resultadoIbf === ResultadoIBF.EQUILIBRIO_ENTRE_DERECHOS ? true : false;

  return { ibfScore, resultadoIbf, empatiaExpresion: E_expresion, aprobadoPorModelo };
}




