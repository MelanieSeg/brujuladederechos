import { Request, Response } from "express";
import UserConfigurationService from "./user-config.service";
import { changeScrapingConfig, scrapingConfigSchema } from "../../schemas/scraping-config";



class UserConfigurationController {

  constructor(private userConfigurationService: UserConfigurationService) {

  }


  getConfiguration = async (req: Request, res: Response) => {
    try {

      const response = await this.userConfigurationService.getConfiguration()
      if (!response?.success || !response.data) {
        return res.status(204).json({ data: null, msg: "No hay informacion para ese periodo" })
      }

      return res.status(200).json({ data: response.data, msg: response.msg })

    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor, ", err });
    }

  }

  setNewConfiguration = async (req: Request, res: Response) => {
    try {

      const validData = changeScrapingConfig.safeParse(req.body)
      const admin = req.user

      if (!validData.success) {
        return res.status(400).json({ error: "Datos ingresados invalidos, UserConfigurationController" });
      }
      if (!admin || !admin.userId || admin.rol !== "ADMIN") {
        return res.status(401).json({ error: "No estas autorizado para realizar esta operacion" })
      }

      const response = await this.userConfigurationService.changeScrapingConfig(validData.data, admin.userId)
      if (!response?.success || !response.data) {
        return res.status(204).json({ data: null, msg: "No hay informacion para ese periodo" })
      }

      return res.status(200).json({ data: response.data, msg: response.msg })

    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor, ", err });
    }

  }
}


export default UserConfigurationController;
