import { CLASIFICACION, ComentarioScraped, Estado, EstadoComentario, Gravedad, MotivoAccion, PrismaClient, ResultadoIBF, TipoAccion } from "@prisma/client";
import { calculateIBF, cleanComment, parseFecha } from "../../utils";
import { CommentQueueDTO, CommentScrapdClassification, CommentScrapped, commentScrappedClassificationSchema, EditCommnetScraperdDto } from "../../schemas/commentScrapped";

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
          where: { id: comentarioScrapedId },
          include: {
            comentarios: {
              orderBy: {
                fechaClasificacion: 'desc'
              },
              take: 1
            }
          }
        });

        if (!comment) {
          throw new Error("Comentario no encontrado.");
        }


        if (comment.clasificado && comment.comentarios.length > 0) {
          console.log("CLASIFICADO_ANTES")

          const { clasificadorId, comentarioScrapedId, ...updateData } = data
          const editData: EditCommnetScraperdDto = {
            commentId: comment.id,
            clasificadorId: user.id,
            motivo: MotivoAccion.RECLASIFICACION,
            detalle: 'Actualización de clasificación manual',
            ...updateData
          };

          return await this.editCommentClassified(editData)
        }

        const {
          ibfScore,
          resultadoIbf,
          empatiaExpresion,
          aprobadoPorModelo
        } = calculateIBF(intensidadPrivacidad, elementoTiempo, empatiaPrivacidad, interesPublico, caracterPersonaPublico, origenInformacion);


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
            ibfScore,
            resultadoIbf,
            aprobadoPorModelo,
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

        const logAuditoria = await prisma.auditoria.create({
          data: {
            usuarioId: user.id,
            tipoAccion: "CLASIFICAR_MANUALMENTE",
            entidad: "ComentarioScraped",
            entidadId: commentUpdatedIbf.id,
            detalles: `Clasificación manual realizada por ${user.name}`
          }
        })

        return { commentUpdatedIbf, comentarioClasificated };
      });

      return { success: true, data: result, msg: "Clasificación manual exitosa" };
    } catch (err) {
      console.error("Error en manualClassificationComment:", err);
      return { success: false, msg: err instanceof Error ? err.message : "Error desconocido en la clasificación manual" };
    }
  }


  //TODO: mejorar el flujo de crear y update de comentarios clasificados
  editCommentClassified = async (updateCommentDto: EditCommnetScraperdDto) => {
    console.log(updateCommentDto)

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: updateCommentDto.clasificadorId }
      });

      if (!user) {
        return { success: false, data: null, msg: "Usuario no válido" };
      }

      const { commentId, clasificadorId, notas, motivo, detalle, ...data } = updateCommentDto

      const result = await this.prisma.$transaction(async (prisma) => {
        const comment = await prisma.comentarioScraped.findFirst({
          where: {
            id: updateCommentDto.commentId
          },
          include: {
            comentarios: true
          }
        })

        if (!comment) {
          throw new Error("Comentario no existe")
        }

        const cambios = []
        for (const field in data) {
          if (data.hasOwnProperty(field)) {
            const oldValue = (comment as any)[field]
            const newValue = (data as any)[field]

            if (oldValue !== newValue) {
              cambios.push({
                campo: field,
                valorAnterior: oldValue !== null && oldValue !== undefined ? oldValue.toString() : null,
                valorNuevo: newValue !== null && newValue !== undefined ? newValue.toString() : null,
              })
            }
          }
        }
        console.log(cambios)

        if (cambios.length === 0 && clasificadorId === comment.comentarios[0]?.clasificadorId) {
          return comment
        }
        let ibfScore = comment.ibfScore;
        let resultadoIbf = comment.resultadoIbf;
        let aprobadoPorModelo = comment.aprobadoPorModelo;

        if (cambios.length > 0) {
          const intensidadPrivacidad = data.intensidadPrivacidad ?? comment.intensidadPrivacidad ?? 1;
          const elementoTiempo = data.elementoTiempo ?? comment.elementoTiempo ?? 0;
          const empatiaPrivacidad = data.empatiaPrivacidad ?? comment.empatiaPrivacidad ?? 0;
          const interesPublico = data.interesPublico ?? comment.interesPublico ?? 1;
          const caracterPersonaPublico = data.caracterPersonaPublico ?? comment.caracterPersonaPublico ?? 0;
          const origenInformacion = data.origenInformacion ?? comment.origenInformacion ?? 0;


          const ibfResult = calculateIBF(
            intensidadPrivacidad,
            elementoTiempo,
            empatiaPrivacidad,
            interesPublico,
            caracterPersonaPublico,
            origenInformacion
          );

          ibfScore = ibfResult.ibfScore;
          resultadoIbf = ibfResult.resultadoIbf;
          aprobadoPorModelo = ibfResult.aprobadoPorModelo;
        }
        const updatedComment = await prisma.comentarioScraped.update({
          where: {
            id: comment.id
          },
          data: {
            ...data,
            ibfScore,
            resultadoIbf,
            aprobadoPorModelo
          },
          include: {
            comentarios: true,
          }
        })



        if (clasificadorId && clasificadorId !== updatedComment.comentarios[0].clasificadorId) {
          if (updatedComment.comentarios && updatedComment.comentarios.length > 0) {
            await prisma.comentarioClasificado.update({
              where: {
                id: updatedComment.comentarios[0].id
              },
              data: {
                clasificadorId: clasificadorId
              }
            })
          } else {
            throw new Error("No hay comentarios relacionados para actualizar 'clasificadorId'")
          }
        }
        if (cambios.length > 0) {
          await prisma.auditoria.create({
            data: {
              usuarioId: user.id,
              tipoAccion: TipoAccion.EDITAR_COMENTARIO_CLASIFICADO,
              motivoAccion: motivo,
              entidad: 'ComentarioScraped',
              entidadId: comment.id,
              detalles: `${updateCommentDto.detalle ? updateCommentDto.detalle + " ." : ""} Operacion realizada por ${user.name}`,
              cambios: {
                create: cambios
              }
            }
          })
        }
        return updatedComment
      })

      return {
        msg: "Comentario editado con exito",
        data: result,
        success: true
      }

    } catch (err) {
      return {
        msg: err instanceof Error ? err.message : 'Error desconocido',
        data: null,
        success: false
      }
    }

  }

  deleteComment = async (commentId: string, userId: string) => {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, data: null, msg: "Usuario no válido" };
      }

      const comment = await this.prisma.comentarioScraped.findFirst({
        where: {
          id: commentId
        }
      })

      if (!comment) {
        return {
          msg: "Comentario no existe",
          data: null,
          success: false
        }
      }

      const deletedComment = await this.prisma.comentarioScraped.update({
        where: {
          id: commentId
        },
        data: {
          deletedAt: new Date()
        }
      })

      await this.prisma.auditoria.create({
        data: {
          usuarioId: userId,
          tipoAccion: "ELIMINAR_COMENTARIO_RECOLECTADO",
          entidad: "comentarioScraped",
          entidadId: deletedComment.id,
          detalles: null
        }
      })
      return {
        msg: "Comentario eliminado con exito",
        data: deletedComment,
        success: true
      }
    } catch (err) {
      return {
        msg: err,
        data: null,
        success: false
      }
    }
  }




  getAllClassifiedComments = async () => {
    try {
      const comments = await this.prisma.comentarioClasificado.findMany({
        where: {
          comentario: {
            deletedAt: null
          }
        },
        include: {
          comentario: {
            include: {
              sitioWeb: true,
            },
          },
        },
        orderBy: {
          fechaClasificacion: "desc"
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
      const comments = await this.prisma.comentarioScraped.findMany({
        orderBy: {
          fechaScraping: "desc"
        }
      });

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
        },
        orderBy: {
          fechaScraping: "asc"
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
  addCommentsBatch = async (comments: CommentQueueDTO[], webSiteName: string) => {

    try {
      const findWebsite = await this.getWebSite(webSiteName);

      if (!findWebsite.data) {
        return { success: false, msg: "No se especifico el sitio web" };
      }

      const gravedadMap: { [key: string]: Gravedad } = {
        grave: Gravedad.GRAVE,
        moderada: Gravedad.MODERADA,
        leve: Gravedad.LEVE
      }
      const dataToInsert = comments.map((comment) => {
        const commentDate = new Date(comment.fecha);
        const fechaClasificacion = comment.fechaClasificacion ? new Date(comment.fechaClasificacion) : null;
        const isClassified = comment.ibf !== undefined;

        return {
          scrapingId: comment.id,
          comentario: cleanComment(comment.texto_limpio),
          sourceUrl: comment.sourceUrl,
          autor: comment.autor || null,
          fechaComentario: commentDate || new Date(),
          sitioWebId: findWebsite.data.id,
          fechaScraping: new Date(),
          gravedad: gravedadMap[comment.gravedad.toLowerCase()] || null,
          ibfScore: comment.ibf || null,
          resultadoIbf: comment.resultadoIbf as ResultadoIBF,
          privacyScore: comment.empatia_privacidad || null,
          expressionScore: comment.empatia_expresion || null,
          interesPublico: comment.interes_publico || 0,
          origenInformacion: comment.origen_informacion || 0,
          empatiaPrivacidad: comment.empatia_privacidad || 0,
          empatiaExpresion: comment.empatia_expresion || 0,
          elementoTiempo: Math.floor(comment.factor_tiempo) || 0,
          caracterPersonaPublico: Math.floor(comment.PF_x) || 0,
          fechaClasificacion: fechaClasificacion,
          clasificado: isClassified,
          intensidadPrivacidad: comment.numerador,
          aprobadoPorModelo: comment.resultadoIbf === ResultadoIBF.EQUILIBRIO_ENTRE_DERECHOS ? true : false,
          estado: EstadoComentario.CLASIFICADO
        };
      });

      if (dataToInsert.length === 0) {
        return { success: false, msg: "No hay comentarios para insertar." };
      }

      const result = await this.prisma.comentarioScraped.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      })

      const insertedIds = comments
        .filter(comment => dataToInsert.some(insert => insert.scrapingId === comment.id))
        .map(comment => comment.id);

      const comentariosInsertados = await this.prisma.comentarioScraped.findMany({
        where: {
          scrapingId: { in: insertedIds },
        },
        select: {
          id: true,
          scrapingId: true,
        },
      });

      const comentariosClasificadosToInsert = comentariosInsertados.map((inserted) => {
        const originalComment = comments.find(c => c.id === inserted.scrapingId);
        if (originalComment && originalComment.ibf !== undefined && originalComment.gravedad) {
          return {
            clasificadorId: null,
            comentarioScrapedId: inserted.id,
            clasificacion: CLASIFICACION.AUTOMATICA,
            notas: 'Clasificación automática por IBF-SERVICE',
            fechaClasificacion: new Date(originalComment.fechaClasificacion),
          };
        }
        return null;
      }).filter(c => c !== null);

      if (comentariosClasificadosToInsert.length > 0) {
        await this.prisma.comentarioClasificado.createMany({
          data: comentariosClasificadosToInsert as any,
          skipDuplicates: true,
        });
      }

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
