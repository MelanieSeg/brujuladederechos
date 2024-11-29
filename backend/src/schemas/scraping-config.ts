import * as z from 'zod'


export const scrapingConfigSchema = z.object({
  frecuenciaScraping: z.number().min(0).max(6),
  activo: z.boolean().default(true),

})

export type ScrapingConfigDTO = z.infer<typeof scrapingConfigSchema>

export const changeScrapingConfig = z.object({
  id: z.string(),
  frecuenciaScraping: z.number().min(0).max(6).optional(),
  activo: z.boolean().default(true).optional(),
})

export type changeScrapingConfigDTO = z.infer<typeof changeScrapingConfig>



