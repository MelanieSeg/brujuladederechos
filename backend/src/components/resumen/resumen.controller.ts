import { Request, Response } from "express";
import ResumenService from "./resumen.service";




class ResumenController {

  constructor(private readonly resumenService: ResumenService) {

  }



  getDataResumenDiario = async (req: Request, res: Response) => {
    try {

      const response = await this.resumenService.getDataResumenDiario()

      if (!response?.data) {
        return res.status(204).json({ data: null, msg: "No hay informacion para ese periodo" })
      }

      return res.status(200).json({ data: response.data, msg: response.msg })

    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor, ", err });
    }
  }

  getDataResumenSemanal = async (req: Request, res: Response) => {
    try {

      const response = await this.resumenService.getDataResumenSemanal()

      if (!response?.data) {
        return res.status(204).json({ data: null, msg: "No hay informacion para ese periodo" })
      }

      return res.status(200).json({ data: response.data, msg: response.msg })

    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor, ", err });
    }
  }


  getDataResumenMensual = async (req: Request, res: Response) => {
    try {

      const response = await this.resumenService.getDataResumenMensual()

      if (!response?.data) {
        return res.status(204).json({ data: null, msg: "No hay informacion para ese periodo" })
      }

      return res.status(200).json({ data: response.data, msg: response.msg })

    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor, ", err });
    }
  }
  getDataResumenAnual = async (req: Request, res: Response) => {
    try {

      const response = await this.resumenService.getDataResumenAnual()

      if (!response?.data) {
        return res.status(204).json({ data: null, msg: "No hay informacion para ese periodo" })
      }

      return res.status(200).json({ data: response.data, msg: response.msg })

    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor, ", err });
    }
  }

}


export default ResumenController
