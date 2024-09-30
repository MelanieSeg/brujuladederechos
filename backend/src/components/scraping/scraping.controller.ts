import { Request, Response } from "express";
import ScrapingService from "./scraping.service";
import { scrappedDataSchema } from "../../schemas/commentScrapped";

class ScrapingController {
  private scrapingService: ScrapingService;
  constructor(scrapingService: ScrapingService) {
    this.scrapingService = scrapingService;
  }

  addComment = async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const validateData = scrappedDataSchema.safeParse(req.body);
      if (!validateData.success) {
        const errors = validateData.error.errors.map((err) => ({
          path: err.path.join(),
          message: err.message,
        }));
        return res.status(400).json({
          error: "Comentarios con información inválida",
          details: errors,
        });
      }

      console.log({ validateData });
      const { comments, webSiteName: webSiteUrl } = validateData.data;

      const validComments = comments.filter(
        (comment) => comment.fecha !== null,
      );

      if (validComments.length === 0) {
        return res.status(400).json({
          error: "No hay comentarios con fechas válidas para almacenar.",
        });
      }

      const result = await this.scrapingService.addComment(
        validComments,
        webSiteUrl,
      );

      return res.status(200).json({
        msg: "Comentarios obtenidos y insertados en la base de datos exitosamente",
      });
    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}

export default ScrapingController;
