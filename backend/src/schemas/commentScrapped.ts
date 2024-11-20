import { Gravedad, MotivoAccion } from "@prisma/client";
import * as z from "zod";

export const commentScrappedSchema = z.object({
  id: z.string(),
  texto: z.string(),
  sourceUrl: z.string(),
  news_url: z.string(),
  fecha: z.number(),
  autor: z.string().optional().nullable(),
  gravedad: z.string()
});

export const scrappedDataSchema = z.object({
  comments: z.array(commentScrappedSchema),
  webSiteName: z.string(),
});

export type CommentScrapped = z.infer<typeof commentScrappedSchema>;
export type ScrappedData = z.infer<typeof scrappedDataSchema>;

//TODO : ajustar los valores de la formula IBF mejor

export const commentScrappedClassificationSchema = z.object({
  comentarioScrapedId: z.string(),
  clasificadorId: z.string(),

  // Privacidad Intrusiva: 1, 2, 3
  intensidadPrivacidad: z.number().int().min(1).max(3).optional(),

  // Tiempo: 0, 0.25, 0.5, 0.75, 1
  elementoTiempo: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]).optional(),

  // Interés Público: 1, 2, 3
  interesPublico: z.number().int().min(1).max(3).optional(),

  // Carácter Público de la Persona: 0, 1, 2, 3
  caracterPersonaPublico: z.number().int().min(0).max(3).optional(),

  // Origen de la Información: 0, -0.25, -0.5, -0.75
  origenInformacion: z.union([
    z.literal(0),
    z.literal(-0.25),
    z.literal(-0.5),
    z.literal(-0.75)
  ]).optional(),

  // Empatía hacia la Privacidad: 0, 0.25, 0.5, 0.75, 1
  empatiaPrivacidad: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]).optional(),

  // Empatía hacia la Libertad de Expresión: 0, 0.25, 0.5, 0.75, 1
  empatiaExpresion: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]).optional(),

  notas: z.string().optional(),
});


export type CommentScrapdClassification = z.infer<typeof commentScrappedClassificationSchema>;

export const editCommentScrapedSchema = commentScrappedClassificationSchema.extend({
  commentId: z.string(),
  motivo: z.nativeEnum(MotivoAccion),
  detalle: z.string().min(1).max(255)
})


export type EditCommnetScraperdDto = z.infer<typeof editCommentScrapedSchema>


export const deleteCommentScrapedSchema = z.object({
  commentId: z.string().cuid(),
  notas: z.string()
})


