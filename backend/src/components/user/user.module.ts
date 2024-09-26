import UserController from "./user.controller";
import UserService from "./user.service";
import UserRouter from "./user.router";
import AuthMiddleware from "../auth/auth.middleware";
import AuthService from "../auth/auth.service";
import EmailService from "../email/email.service";

const emailService = new EmailService();
const userService = new UserService(emailService);
const authService = new AuthService();
const userController = new UserController(userService);
const authMiddleware = new AuthMiddleware(authService);
const userRouter = new UserRouter(userController, authMiddleware);

export default {
  router: userRouter.router,
};
