import AuthController from "./auth.controller";
import AuthService from "./auth.service";
import AuthRouter from "./auth.router";
import UserService from "../user/user.service";
import EmailService from "../email/email.service";
import CloudinaryService from "../cloudinary/cloudinary.services";
import cloudinary from "../../config/cloudinary";


const cloudinaryConfigInstance = cloudinary
const emailService = new EmailService();
const cloudinaryService = new CloudinaryService(cloudinaryConfigInstance)
const userService = new UserService(emailService, cloudinaryService);
const authService = new AuthService();
const authController = new AuthController(authService, userService);
const authRouter = new AuthRouter(authController);

export default {
  router: authRouter.router,
};
