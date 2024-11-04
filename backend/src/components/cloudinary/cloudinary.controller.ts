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

      const file = req.file

      if (!file) {
        return res.status(400).json({ message: 'No se ha proporcionado archivo' });
      }

      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: 'No estas autorizado para cambiar la imagen de perfil' });
      }

      const publicId = `profile_${userId}`

      const uploadImageResult = await this.cloudinaryService.uploadImage(file, publicId)

      if (!uploadImageResult.success) {
        return res.status(500).json({ msg: uploadImageResult.message })
      }

      //update image del user y eliminar la anterior 

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
