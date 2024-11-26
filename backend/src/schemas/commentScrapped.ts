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
  intensidadPrivacidad: z.number().int().min(1).max(3),
  elementoTiempo: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]),
  interesPublico: z.number().int().min(1).max(3),
  caracterPersonaPublico: z.number().int().min(0).max(3),
  origenInformacion: z.union([
    z.literal(0),
    z.literal(-0.25),
    z.literal(-0.5),
    z.literal(-0.75)
  ]),
  empatiaPrivacidad: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]),
  empatiaExpresion: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]),
  notas: z.string().optional(),
});

export type CommentScrapdClassification = z.infer<typeof commentScrappedClassificationSchema>;


const baseClassificationSchema = z.object({
  intensidadPrivacidad: z.number().int().min(1).max(3).optional(),
  elementoTiempo: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]).optional(),
  interesPublico: z.number().int().min(1).max(3).optional(),
  caracterPersonaPublico: z.number().int().min(0).max(3).optional(),
  origenInformacion: z.union([
    z.literal(0),
    z.literal(-0.25),
    z.literal(-0.5),
    z.literal(-0.75)
  ]).optional(),
  empatiaPrivacidad: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]).optional(),
  empatiaExpresion: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]).optional(),
});

export const editCommentScrapedSchema = z.object({
  commentId: z.string().min(1),
  clasificadorId: z.string().min(1),
  motivo: z.nativeEnum(MotivoAccion),
  detalle: z.string().min(1).max(255).optional(),
  notas: z.string().optional(),
}).merge(baseClassificationSchema);

export type EditCommnetScraperdDto = z.infer<typeof editCommentScrapedSchema>


export const deleteCommentScrapedSchema = z.object({
  commentId: z.string().cuid(),
  notas: z.string()
})

const SentimientoEnum = z.enum(['NEG', 'NEU', 'POS']);

const EmocionEnum = z.enum([
  'anger',
  'disgust',
  'sadness',
  'joy',
  'surprise',
  'fear',
]);

const GravedadEnum = z.enum(['grave', 'moderada', 'leve']);

const ResultadoIbfEnum = z.enum([
  'PRIVACIDAD_PREDOMINA',
  'LIBERTAD_EXPRESION_PREDOMINA',
  'EQUILIBRIO_ENTRE_DERECHOS',
]);

export const commentQueueSchema = z.object({
  id: z.string(),
  texto: z.string(),
  fecha: z.number().int().positive(),
  autor: z.string(),
  sourceUrl: z.string().url(),
  news_url: z.string().url(),
  texto_limpio: z.string(),
  sentimiento: SentimientoEnum,
  emocion: EmocionEnum,
  gravedad: GravedadEnum,
  factor_tiempo: z.number().nonnegative(),
  interes_publico: z.number().nonnegative(),
  origen_informacion: z.number(),
  empatia_privacidad: z.number().min(0).max(1),
  empatia_expresion: z.number().min(0).max(1),
  personas_mencionadas: z.array(z.string()),
  figuras_publicas_mencionadas: z.array(z.string()),
  PF_x: z.number().int().nonnegative(),
  PR_x: z.number().int().nonnegative(),
  V: z.number().int().nonnegative(),
  numerador: z.number(),
  denominador: z.number(),
  ibf: z.number(),
  resultadoIbf: ResultadoIbfEnum,
  fechaClasificacion: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de clasificación invalida. Se espara que este en formato ISO.",
  }),
});


export type CommentQueueDTO = z.infer<typeof commentQueueSchema>


