import cloudinary from "../../config/cloudinary";
import CloudinaryController from "./cloudinary.controller";
import CloudinaryRouter from "./cloudinary.router";
import CloudinaryService from "./cloudinary.services";




const clouduinaryInstance = cloudinary
const cloudinaryService = new CloudinaryService(clouduinaryInstance);
const cloudinaryController = new CloudinaryController(cloudinaryService)
const cloudinaryRouter = new CloudinaryRouter(cloudinaryController)


export default {
  router: cloudinaryRouter.router
}
