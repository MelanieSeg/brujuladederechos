import crypto from "crypto";

export function generateRandomToken() {
  const randomPart = crypto.randomInt(10000, 100000);
  const timePart = new Date().getMilliseconds();
  const token = (randomPart + timePart).toString().slice(0, 6);
  return token;
}

export function sliceSourceUrl(sourceUrl: string) {}

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
