import cloudinary from "../../config/cloudinary"


class CloudinaryService {

  private cloud: typeof cloudinary
  constructor(cloudinaryInstance: typeof cloudinary) {
    this.cloud = cloudinaryInstance
  }



  uploadImage = async (file: Express.Multer.File, publicId: string) => {
    try {

      return new Promise<{
        success: boolean;
        message: string;
        url?: string;
        url_secure?: string;
      }>((resolve, reject) => {
        const stream = this.cloud.uploader.upload_stream({
          public_id: publicId,
          folder: 'profile_images',
          resource_type: 'image'
        },
          (error, result) => {
            if (error) {
              resolve({
                success: false,
                message: `Error al subir la imagen ${error.message}`
              })
            } else {
              resolve({
                success: true,
                message: 'Imagen subida exitosamente',
                url: result?.url,
                url_secure: result?.secure_url
              })
            }
          }
        );
        stream.end(file.buffer)
      })
    } catch (err) {
      return {
        success: false,
        message: `Error al subir imagen, ${err}`
      }
    }
  }
}


export default CloudinaryService;
