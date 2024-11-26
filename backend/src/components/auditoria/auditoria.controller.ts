import { Request, Response } from "express";
import AuditoriaService from "./auditoria.service";


class AuditoriaController {

  constructor(private readonly auditoriaService: AuditoriaService) { }



  getAllData = async (req: Request, res: Response) => {
    try {

      const response = await this.auditoriaService.getAll()

      if (!response) {
        return res.status(204).json({ data: null, msg: "No hay informacion de auditoria " })
      }

      return res.status(200).json({ data: response, msg: "Se obtuvo la informacion exitosamente" })

    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor, ", err });
    }
  }
}



export default AuditoriaController
