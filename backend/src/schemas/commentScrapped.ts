import { Gravedad } from "@prisma/client";
import * as z from "zod";

export const commentScrappedSchema = z.object({
  id: z.string(),
  texto: z.string(),
  sourceUrl: z.string(),
  news_url: z.string(),
  fecha: z.number(),
  autor: z.string().optional().nullable(),
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
  intensidadPrivacidad: z.number().int().min(1).max(3).optional(),
  elementoTiempo: z.number().int().min(0).max(1).optional(),
  interesPublico: z.number().int().min(1).max(3).optional(),
  caracterPersonaPublico: z.number().int().min(1).max(2).optional(),
  origenInformacion: z.number().int().min(0).max(10).optional(),
  empatiaPrivacidad: z.number().min(0).max(1).optional(),
  empatiaExpresion: z.number().min(0).max(1).optional(),
  notas: z.string().optional(),
})

export type CommentScrapdClassification = z.infer<typeof commentScrappedClassificationSchema>;

