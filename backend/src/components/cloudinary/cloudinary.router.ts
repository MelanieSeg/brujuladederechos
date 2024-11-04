import express from 'express'
import CloudinaryController from "./cloudinary.controller";



class CloudinaryRouter {
  constructor(
    private readonly cloudinaryController: CloudinaryController
  ) { }


  get router() {
    const router = express.Router();
    router.route('/upload-image').post(this.cloudinaryController.uploadImage)
    return router
  }
}


export default CloudinaryRouter
