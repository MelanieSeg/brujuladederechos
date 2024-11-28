import { PrismaClient } from "@prisma/client";
import { changeScrapingConfigDTO, ScrapingConfigDTO } from "../../schemas/scraping-config";



class UserConfigurationService {
  private readonly prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient()
  }


  /*
   Frecuencia
   0 = 10 min
   1 = 30 min
   2 = 1 hora
   3 = 3 horas
   4 = 8 horas
   5 = 12 horas
   6 = 24 horas
  */
  getConfiguration = async () => {
    try {
      const config = await this.prisma.configScraping.findMany()

    } catch (err) {
      return {
        success: false,
        data: null,
        msg: err
      }
    }
  }

  changeScrapingConfig = async (changeScrapingConfig: changeScrapingConfigDTO, adminId: string) => {
    try {




      const config = await this.prisma.configScraping.findFirst({
        where: {
          id: changeScrapingConfig.id
        }
      })

      if (!config) {
        return {
          success: false,
          data: null,
          msg: "No se pudo cambiar la configuracion, id incorrect"
        }
      }

      const updatedConfg = await this.prisma.configScraping.update({
        where: {
          id: config.id
        },
        data: {
          ...changeScrapingConfig
        }
      })

      /*
      const logAuditoria = await this.prisma.auditoria.create({
        data: {
          usuarioId: adminId,
          tipoAccion://TODO:: agregar enum de cambio de configuracion,
            entidad: "ConfigScraping",
          entidadId: updatedConfg.id,
          detalles: "Cambio en configuracion de scraping"
        }
      })
      */

      return {
        success: true,
        data: updatedConfg,
        msg: "Se cambio la configuracion de scraping exitosamente"
      }

    } catch (err) {
      return {
        success: false,
        data: null,
        msg: err,
      }
    }
  }
}
