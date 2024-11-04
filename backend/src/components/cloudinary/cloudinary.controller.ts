import { Request, Response } from "express";
import CloudinaryService from "./cloudinary.services";



class CloudinaryController {

  constructor(
    //esta es una forma de facil de declararlo
    private readonly cloudinaryService: CloudinaryService
  ) {

  }



  uploadImage = async (req: Request, res: Response) => {
    try {
      //TODO: Crear un UploadImageDTO para poder crear las validaciones para el req.body

      const data = req.body

      const uploadImageResult = await this.cloudinaryService.uploadImage(data.image, data.imageId)

      if (!uploadImageResult.success) {
        return res.status(500).json({ msg: uploadImageResult.message })
      }

      return res.status(200).json({
        url: uploadImageResult.url,
        url_secure: uploadImageResult.url_secure,
        message: uploadImageResult.message
      })

    } catch (err) {
      return res.status(500).json({ msg: `Error interno del servidor, err` })
    }
  }

}


export default CloudinaryController
