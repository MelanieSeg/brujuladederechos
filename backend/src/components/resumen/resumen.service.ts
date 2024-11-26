import { EstadoComentario, Gravedad, PrismaClient, ResultadoIBF } from "@prisma/client";


class ResumenService {
  private readonly prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient()
  }


  getCountPendingComments = async () => {
    const count = await this.prisma.comentarioScraped.count({
      where: {
        clasificado: false,
        estado: 'PENDIENTE_CLASIFICACION'
      }
    })

    return count
  }

  getCountClasifiedComments = async () => {
    const count = await this.prisma.comentarioScraped.count({
      where: {
        estado: "CLASIFICADO"
      }
    })
    return count
  }

  getCountGraves = async () => {
    const count = await this.prisma.comentarioScraped.count({
      where: {
        gravedad: 'GRAVE'
      }
    })
    return count
  }

  getDataResumenAnual = async () => {
    try {
      const currentYear = new Date().getFullYear();

      const months = Array.from({ length: 12 }, (_, i) => i);

      const monthlyCounts = await Promise.all(
        months.map(async (month) => {
          const startOfMonth = new Date(currentYear, month, 1, 0, 0, 0, 0);

          const endOfMonth = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);

          const [totalComments, acceptedComments, totalGraves, totalPendingComments] = await Promise.all([
            this.prisma.comentarioScraped.count({
              where: {
                fechaClasificacion: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                },
              },
            }),
            this.prisma.comentarioScraped.count({
              where: {
                resultadoIbf: "LIBERTAD_EXPRESION_PREDOMINA",
                fechaClasificacion: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                },
              },
            }),
            this.prisma.comentarioScraped.count({
              where: {
                gravedad: Gravedad.GRAVE,
                fechaClasificacion: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                }
              }
            }),
            this.prisma.comentarioScraped.count({
              where: {
                estado: EstadoComentario.PENDIENTE_CLASIFICACION,
                fechaScraping: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                }
              }
            })
          ]);

          const approvalRate =
            totalComments > 0 ? (acceptedComments / totalComments) * 100 : 0;

          return {
            month: startOfMonth.toLocaleString("es-ES", { month: "long" }),
            totalComments,
            acceptedComments,
            totalGraves,
            totalPendingComments
          };
        })
      );

      const totalYearComments = monthlyCounts.reduce(
        (acc, month) => acc + month.totalComments,
        0
      );

      const totalYearAcceptedComments = monthlyCounts.reduce(
        (acc, month) => acc + month.acceptedComments,
        0
      );

      const yearlyApprovalRate =
        totalYearComments > 0
          ? (totalYearAcceptedComments / totalYearComments) * 100
          : 0;

      const totalYearPendingComments = monthlyCounts.reduce((acc, month) => acc + month.totalGraves, 0);
      const totalYearGraveComments = monthlyCounts.reduce((acc, month) => acc + month.totalPendingComments, 0);


      const commentsByWebsite = await this.prisma.comentarioScraped.groupBy({
        by: ['sitioWebId'],
        _count: {
          id: true,
        }
      })

      const commentsByWebsiteWithNames = await Promise.all(
        commentsByWebsite.map(async (entry) => {
          const site = await this.prisma.sitioWeb.findUnique({
            where: {
              id: entry.sitioWebId,
            },
            select: {
              nombre: true,
              id: true
            }
          })

          return {
            sitioWeb: site?.nombre,
            totalComentariosWebsite: entry._count.id,
          }
        })
      )

      return {
        success: true,
        data: {
          total_comentarios_clasificados: totalYearComments,
          total_comentarios_aceptados: totalYearAcceptedComments,
          tasa_de_aprobacion_anual: yearlyApprovalRate.toFixed(2),
          comentarios_por_mes: monthlyCounts,
          total_comentarios_graves: totalYearGraveComments,
          total_comentarios_pendientes: totalYearPendingComments,
          total_comentarios_por_sitio_web: commentsByWebsiteWithNames
        },
        msg: "Operación exitosa",
      };
    } catch (err) {
      console.error("Error en getDataResumenAnual:", err);
      return {
        success: false,
        data: null,
        msg: "Error al obtener el resumen anual",
      };
    }
  };

  getDataResumenDiario = async () => {
    try {

      const today = new Date()
      today.setHours(0, 0, 0, 0)


      const now = new Date()


      const intervals = [];
      for (let hour = 0; hour < 24; hour += 2) {
        const start = new Date(today)
        start.setHours(hour)

        const end = new Date(today)
        end.setHours(hour + 2)

        if (start >= now) break

        intervals.push({ start, end })
      }


      const intervalCounts = await Promise.all(
        intervals.map(({ start, end }) => this.getCommentsCountInInterval.call(this, start, end))
      )


      const [countAceptedComments, aceptedCommentsToday, totalCommentsToday] = await Promise.all([
        this.prisma.comentarioScraped.count({
          where: {
            resultadoIbf: "LIBERTAD_EXPRESION_PREDOMINA",
          }
        }),
        this.prisma.comentarioScraped.count({
          where: {
            resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
            fechaClasificacion: {
              gte: today
            }
          }
        }),
        this.prisma.comentarioScraped.count({
          where: {
            fechaClasificacion: {
              gte: today
            }
          }
        }),
      ])

      const ratioAprobacion = totalCommentsToday > 0 ? (aceptedCommentsToday / totalCommentsToday) * 100 : 0;

      return {
        success: true,
        data: {
          total_comentarios_analisados: totalCommentsToday,
          total_comentarios_aceptados_hoy: aceptedCommentsToday,
          tasa_de_aprobacion_hoy: ratioAprobacion.toFixed(2),
          comentarios_por_intervalo: intervalCounts
        },
        msg: "Operacion exitosa"
      }

    } catch (err) {

    }
  }

  getDataResumenSemanal = async () => {
    try {
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        days.push(day);
      }

      const dailyCounts = await Promise.all(
        days.map(async (day) => {
          const start = new Date(day);
          start.setHours(0, 0, 0, 0);

          const end = new Date(day);
          end.setHours(23, 59, 59, 999);

          const count = await this.prisma.comentarioScraped.count({
            where: {
              fechaClasificacion: {
                gte: start,
                lte: end,
              },
            },
          });

          const approvalRate = await this.getApprovalRateForInterval(start, end)

          return {
            day: start.toLocaleDateString('es-ES', { weekday: 'long' }),
            count,
            approvalRate
          };
        })
      );



      const [countAcceptedComments, acceptedCommentsThisWeek, totalCommentsThisWeek, totalComments] =
        await Promise.all([
          this.prisma.comentarioScraped.count({
            where: {
              resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
            },
          }),
          this.prisma.comentarioScraped.count({
            where: {
              resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
              fechaClasificacion: {
                gte: startOfWeek,
                lte: endOfWeek,
              },
            },
          }),
          this.prisma.comentarioScraped.count({
            where: {
              fechaClasificacion: {
                gte: startOfWeek,
                lte: endOfWeek,
              },
            },
          }),
          this.prisma.comentarioScraped.count(),
        ]);

      const approvalRateThisWeek =
        totalCommentsThisWeek > 0 ? (acceptedCommentsThisWeek / totalCommentsThisWeek) * 100 : 0;

      return {
        success: true,
        data: {
          total_comentarios_analisados: totalComments,
          total_comentarios_aceptados: countAcceptedComments,
          total_comentarios_analisados_semana: totalCommentsThisWeek,
          total_comentarios_aceptados_semana: acceptedCommentsThisWeek,
          tasa_de_aprobacion_semana: approvalRateThisWeek.toFixed(2),
          comentarios_por_dia: dailyCounts,
        },
        msg: 'Operación exitosa',
      };
    } catch (err) {
      console.error('Error en getDataResumenSemanal:', err);
      return {
        success: false,
        data: null,
        msg: 'Error al obtener el resumen semanal',
      };
    }
  };

  getDataResumenMensual = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const daysInMonth = endOfMonth.getDate();

      const days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(startOfMonth);
        day.setDate(i);
        days.push(day);
      }

      const dailyCounts = await Promise.all(
        days.map(async (day) => {
          const start = new Date(day);
          start.setHours(0, 0, 0, 0);

          const end = new Date(day);
          end.setHours(23, 59, 59, 999);

          const count = await this.prisma.comentarioScraped.count({
            where: {
              fechaClasificacion: {
                gte: start,
                lte: end,
              },
            },
          });

          const approvalRate = await this.getApprovalRateForInterval(start, end)

          return {
            day: start.getDate(),
            count,
            approvalRate
          };
        })
      );
      const [countAcceptedComments, acceptedCommentsThisMonth, totalCommentsThisMonth, totalComments] =
        await Promise.all([
          this.prisma.comentarioScraped.count({
            where: {
              resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
            },
          }),
          this.prisma.comentarioScraped.count({
            where: {
              resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
              fechaClasificacion: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
          }),
          this.prisma.comentarioScraped.count({
            where: {
              fechaClasificacion: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
          }),
          this.prisma.comentarioScraped.count(),
        ]);

      const approvalRateThisMonth =
        totalCommentsThisMonth > 0 ? (acceptedCommentsThisMonth / totalCommentsThisMonth) * 100 : 0;

      return {
        success: true,
        data: {
          total_comentarios_analisados: totalComments,
          total_comentarios_aceptados: countAcceptedComments,
          total_comentarios_analisados_mes: totalCommentsThisMonth,
          total_comentarios_aceptados_mes: acceptedCommentsThisMonth,
          tasa_de_aprobacion_mes: approvalRateThisMonth.toFixed(2),
          comentarios_por_dia: dailyCounts,
        },
        msg: 'Operación exitosa',
      };
    } catch (err) {
      console.error('Error en getDataResumenMensual:', err);
      return {
        success: false,
        data: null,
        msg: 'Error al obtener el resumen mensual',
      };
    }
  };

  getCommentsCountInInterval = async (start: Date, end: Date) => {
    try {
      const [totalCount, acceptedCount] = await Promise.all([
        this.prisma.comentarioScraped.count({
          where: {
            fechaClasificacion: {
              gte: start,
              lt: end,
            },
          },
        }),
        this.prisma.comentarioScraped.count({
          where: {
            resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
            fechaClasificacion: {
              gte: start,
              lt: end,
            },
          },
        }),
      ]);

      const approvalRate = totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0;

      return {
        interval: `${start.getHours().toString().padStart(2, '0')}:00 - ${end
          .getHours()
          .toString()
          .padStart(2, '0')}:00`,
        totalCount,
        acceptedCount,
        approvalRate: approvalRate.toFixed(2),
      };
    } catch (err) {
      console.error(`Error en getCommentsCountInInterval para el intervalo ${start} - ${end}:`, err);
      return {
        interval: `${start.getHours().toString().padStart(2, '0')}:00 - ${end
          .getHours()
          .toString()
          .padStart(2, '0')}:00`,
        totalCount: 0,
        acceptedCount: 0,
        approvalRate: "0.00",
        msg: err instanceof Error ? err.message : String(err),
      };
    }
  };

  private getApprovalRateForInterval = async (start: Date, end: Date) => {
    try {
      const [totalCount, acceptedCount] = await Promise.all([
        this.prisma.comentarioScraped.count({
          where: {
            fechaClasificacion: {
              gte: start,
              lt: end,
            },
          },
        }),
        this.prisma.comentarioScraped.count({
          where: {
            resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
            fechaClasificacion: {
              gte: start,
              lt: end,
            },
          },
        }),
      ]);

      const approvalRate = totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0;

      return {
        totalCount,
        acceptedCount,
        approvalRate: approvalRate.toFixed(2),
      };
    } catch (err) {
      console.error(`Error en getApprovalRateForInterval para el intervalo ${start} - ${end}:`, err);
      return {
        totalCount: 0,
        acceptedCount: 0,
        approvalRate: "0.00",
      };
    }
  };


}



export default ResumenService;
