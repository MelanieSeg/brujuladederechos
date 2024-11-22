import { PrismaClient, ResultadoIBF } from "@prisma/client";




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

      const comentariosClasificados = await this.prisma.comentarioScraped.findMany({
        where: {
          estado: "CLASIFICADO"
        },
        select: {
          id: true,
          fechaClasificacion: true
        }
      })

      return {
        success: true,
        data: {
          cantidad_comentarios_pendientes: this.getCountPendingComments(),
          cantidad_comentarios_clasificados: this.getCountClasifiedComments(),
          cantidad_comentarios_graves: this.getCountGraves(),
          comentarios_clasificados: comentariosClasificados
        },
        msg: "Operacion exitosa"
      }

    } catch (err) {
      return {
        success: false,
        data: null,
        msg: err
      }
    }
  }

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
          total_comentarios_aceptados_hoy: countAceptedComments,
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

          return {
            day: start.toLocaleDateString('es-ES', { weekday: 'long' }),
            count,
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

          return {
            day: start.getDate(),
            count,
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


  /* 
   //funcion generica para no repetir codigo
getDataResumen = async (periodo: 'diario' | 'semanal' | 'mensual') => {
  try {
    let startDate: Date;
    let endDate: Date;
    let intervalUnit: 'hour' | 'day';

    const now = new Date();

    if (periodo === 'diario') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      intervalUnit = 'hour';
    } else if (periodo === 'semanal') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Lunes
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      intervalUnit = 'day';
    } else if (periodo === 'mensual') {
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Último día del mes
      endDate.setHours(23, 59, 59, 999);
      intervalUnit = 'day';
    } else {
      throw new Error('Período inválido');
    }

    // Generar los intervalos
    const intervals = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      const start = new Date(current);

      let end: Date;
      if (intervalUnit === 'hour') {
        start.setMinutes(0, 0, 0);
        end = new Date(start);
        end.setHours(end.getHours() + 2);
      } else {
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(end.getDate() + 1);
      }

      intervals.push({ start, end });

      if (intervalUnit === 'hour') {
        current.setHours(current.getHours() + 2);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    // Obtener los conteos por intervalo
    const intervalCounts = await Promise.all(
      intervals.map(async ({ start, end }) => {
        const count = await this.prisma.comentarioScraped.count({
          where: {
            fechaClasificacion: {
              gte: start,
              lt: end,
            },
          },
        });

        let label: string;
        if (intervalUnit === 'hour') {
          label = `${start.getHours().toString().padStart(2, '0')}:00 - ${end
            .getHours()
            .toString()
            .padStart(2, '0')}:00`;
        } else {
          label = start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
        }

        return {
          interval: label,
          count,
        };
      })
    );

    // Obtener los totales y tasas
    const [countAcceptedComments, acceptedCommentsInPeriod, totalCommentsInPeriod, totalComments] =
      await Promise.all([
        // Total de comentarios aceptados
        this.prisma.comentarioScraped.count({
          where: {
            resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
          },
        }),
        // Comentarios aceptados en el período
        this.prisma.comentarioScraped.count({
          where: {
            resultadoIbf: ResultadoIBF.LIBERTAD_EXPRESION_PREDOMINA,
            fechaClasificacion: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // Total de comentarios en el período
        this.prisma.comentarioScraped.count({
          where: {
            fechaClasificacion: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // Total de comentarios analizados
        this.prisma.comentarioScraped.count(),
      ]);

    const approvalRateInPeriod =
      totalCommentsInPeriod > 0 ? (acceptedCommentsInPeriod / totalCommentsInPeriod) * 100 : 0;

    return {
      success: true,
      data: {
        periodo,
        total_comentarios_analisados: totalComments,
        total_comentarios_aceptados: countAcceptedComments,
        total_comentarios_analisados_periodo: totalCommentsInPeriod,
        total_comentarios_aceptados_periodo: acceptedCommentsInPeriod,
        tasa_de_aprobacion_periodo: approvalRateInPeriod.toFixed(2),
        comentarios_por_intervalo: intervalCounts,
      },
      msg: 'Operación exitosa',
    };
  } catch (err) {
    console.error('Error en getDataResumen:', err);
    return {
      success: false,
      data: null,
      msg: 'Error al obtener el resumen',
    };
  }
};

  */


  getCommentsCountInInterval = async (start: Date, end: Date) => {
    try {
      const count = await this.prisma.comentarioScraped.count({
        where: {
          fechaClasificacion: {
            gte: start,
            lt: end,
          },
        },
      });
      return {
        interval: `${start.getHours().toString().padStart(2, '0')}:00 - ${end
          .getHours()
          .toString()
          .padStart(2, '0')}:00`,
        count,
      };

    } catch (err) {
      return {
        interval: null,
        count: 0,
        msg: err
      }
    }
  }

}



export default ResumenService;
