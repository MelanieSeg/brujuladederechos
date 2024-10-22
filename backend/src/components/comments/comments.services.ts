import { CLASIFICACION, ComentarioScraped, EstadoComentario, PrismaClient } from "@prisma/client";
import { cleanComment, parseFecha } from "../../utils";
import { CommentScrapdClassification, CommentScrapped, commentScrappedClassificationSchema } from "../../schemas/commentScrapped";

class CommentsService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  manualClassificationComment = async (data: CommentScrapdClassification, userId: string): Promise<{ success: boolean; data?: any; msg: string }> => {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, msg: "Usuario no válido" };
      }

      const {
        comentarioScrapedId,
        intensidadPrivacidad,
        elementoTiempo,
        interesPublico,
        caracterPersonaPublico,
        origenInformacion,
        empatiaPrivacidad,
        empatiaExpresion,
        notas,
      } = data;

      const result = await this.prisma.$transaction(async (prisma) => {
        const comment = await prisma.comentarioScraped.findUnique({
          where: { id: comentarioScrapedId }
        });

        if (!comment) {
          throw new Error("Comentario no encontrado.");
        }

        const commentUpdatedIbf = await prisma.comentarioScraped.update({
          where: { id: comment.id },
          data: {
            clasificado: true,
            fechaClasificacion: new Date(),
            estado: EstadoComentario.CLASIFICADO,
            intensidadPrivacidad,
            elementoTiempo,
            interesPublico,
            caracterPersonaPublico,
            origenInformacion,
            empatiaPrivacidad,
            empatiaExpresion,
          }
        });

        const comentarioClasificated = await prisma.comentarioClasificado.create({
          data: {
            clasificadorId: user.id,
            notas: notas || null,
            clasificacion: CLASIFICACION.MANUAL,
            comentarioScrapedId: commentUpdatedIbf.id
          }
        });

        return { commentUpdatedIbf, comentarioClasificated };
      });

      return { success: true, data: result, msg: "Clasificación manual exitosa" };
    } catch (err) {
      console.error("Error en manualClassificationComment:", err);
      return { success: false, msg: err instanceof Error ? err.message : "Error desconocido en la clasificación manual" };
    }
  }

  getAllClassifiedComments = async () => {
    try {
      const comments = await this.prisma.comentarioClasificado.findMany({
        include: {
          comentario: {
            include: {
              sitioWeb: true
            }
          }
        }
      });
      //conversar el tema que es mejor implementar paginacion desde backend en la consulta que implementarla desde el front

      if (comments.length === 0) {
        return { data: null, msg: "No existen comentarios clasificados todavia." }
      }

      return { data: comments, msg: "Se obtuvieron los comentarios clasificados exitosamente" }

    } catch (err) {
      return { data: null, msg: err }
    }
  }

  getAllComments = async () => {
    try {
      const comments = await this.prisma.comentarioScraped.findMany();

      return {
        data: comments,
        msg: "Se obtuvieron los comentarios exitosamente",
      };
    } catch (err) {
      return { data: null, msg: err };
    }
  };

  getAllCommentsPending = async () => {
    try {
      const pendingComments = await this.prisma.comentarioScraped.findMany({
        where: {
          clasificado: false
        }
      })

      return {
        data: pendingComments,
        message: "Se obtuvieron todo los comentarios pendientes exitosamente"
      }

    } catch (err) {
      return { data: null, message: err }
    }
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
  addCommentsBatch = async (comments: CommentScrapped[], webSiteName: string) => {
    try {
      const findWebsite = await this.getWebSite(webSiteName);

      if (!findWebsite.data) {
        return { success: false, msg: "No se especifico el sitio web" };
      }

      const dataToInsert = comments.map((comment) => {

        const commentDate = parseFecha(String(comment.fecha));
        if (!commentDate) {
          return {
            scrapingId: comment.id,
            comentario: cleanComment(comment.texto),
            sourceUrl: comment.sourceUrl,
            autor: comment.autor || null,
            fechaComentario: new Date(),
            sitioWebId: findWebsite.data.id,
            fechaScraping: new Date(),
          }
        }
        return {
          scrapingId: comment.id,
          comentario: cleanComment(comment.texto),
          sourceUrl: comment.sourceUrl,
          autor: comment.autor || null,
          fechaComentario: commentDate,
          sitioWebId: findWebsite.data.id,
          fechaScraping: new Date(),
        }
      });

      if (dataToInsert.length === 0) {
        return { success: false, msg: "No hay comentarios para insertar." };
      }

      const result = await this.prisma.comentarioScraped.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      })

      return { success: true };

    } catch (err) {
      console.log("Error al insertar comentarios en lote", err);
      return { success: false, msg: err }
    }
  }


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
  private formatDateForPostgres = (date: Date): string => {
    return date.toISOString().replace('T', ' ').replace('Z', '');
  };

  close = async () => {
    await this.prisma.$disconnect();
  }
}

export default CommentsService;
