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
