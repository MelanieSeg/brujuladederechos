import UserController from "./user.controller";
import UserService from "./user.service";
import UserRouter from "./user.router";
import AuthMiddleware from "../auth/auth.middleware";
import AuthService from "../auth/auth.service";
import EmailService from "../email/email.service";
import cloudinary from "../../config/cloudinary";
import CloudinaryService from "../cloudinary/cloudinary.services";

const cloudinaryConfigInstance = cloudinary
const cloudinaryService = new CloudinaryService(cloudinaryConfigInstance)
const emailService = new EmailService();
const userService = new UserService(emailService, cloudinaryService);
const authService = new AuthService();
const userController = new UserController(userService);
const authMiddleware = new AuthMiddleware(authService);
const userRouter = new UserRouter(userController, authMiddleware);

export default {
  router: userRouter.router,
};
