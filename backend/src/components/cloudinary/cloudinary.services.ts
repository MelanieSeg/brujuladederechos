import cloudinary from "../../config/cloudinary"


class CloudinaryService {

  private cloud: typeof cloudinary
  constructor(cloudinaryInstance: typeof cloudinary) {
    this.cloud = cloudinaryInstance
  }



  uploadImage = async (image: string, publicId: string) => {
    try {
      const uploadResult = await this.cloud.uploader
        .upload(image, {
          public_id: publicId
        })
        .catch((error) => {
          throw new Error(error)
        })

      return {
        success: true,
        message: "Imagen subida exitosamente ",
        url: uploadResult.url,
        url_secure: uploadResult.secure_url
      }

    } catch (err) {
      return {
        success: false,
        message: `Error al subir imagen, ${err}`
      }
    }
  }
}


export default CloudinaryService;
