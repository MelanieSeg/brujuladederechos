import { ComentarioScraped, PrismaClient } from "@prisma/client";
import { cleanComment, parseFecha } from "../../utils";
import { CommentScrapped } from "../../schemas/commentScrapped";

class ScrapingService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  addComment = async (comments: CommentScrapped[], webSiteName: string) => {
    try {
      const findWebsite = await this.getWebSite(webSiteName);

      if (!findWebsite.data) {
        return { success: false, msg: "No se especifico el sitio web" };
      }

      const dataToInsert = comments.map((comment) => {
        const commentDate = parseFecha(String(comment.fecha));
        return {
          scrapingId: comment.id,
          comentario: cleanComment(comment.texto),
          sourceUrl: comment.sourceUrl,
          autor: comment.autor || null,
          fechaComentario: commentDate,
          sitioWebId: findWebsite.data?.id,
          fechaScraping: new Date(),
        };
      });

      const upsertPromises = dataToInsert.map((comment) =>
        this.prisma.comentarioScraped.upsert({
          where: {
            scrapingId: comment.scrapingId,
          },
          update: {
            comentario: comment.comentario,
            sourceUrl: comment.sourceUrl,
            autor: comment.autor,
            fechaComentario: comment.fechaComentario,
            fechaScraping: comment.fechaScraping,
          },
          create: comment,
        }),
      );

      await Promise.all(upsertPromises);

      return { success: true };
    } catch (err) {
      return { success: false, msg: err };
    }
  };
  getWebSite = async (urlWeb: string) => {
    try {
      const web = await this.prisma.sitioWeb.findFirst({
        where: {
          url: urlWeb,
        },
      });

      if (!web) {
        return { success: false, msg: "No se encontro el website" };
      }

      return { success: true, msg: "Website existente", data: web };
    } catch (err) {
      return { success: false, msg: err, data: null };
    }
  };
}

export default ScrapingService;
