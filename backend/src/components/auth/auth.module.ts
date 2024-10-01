import AuthController from "./auth.controller";
import AuthService from "./auth.service";
import AuthRouter from "./auth.router";
import UserService from "../user/user.service";
import EmailService from "../email/email.service";

const emailService = new EmailService();
const userService = new UserService(emailService);
const authService = new AuthService();
const authController = new AuthController(authService, userService);
const authRouter = new AuthRouter(authController);

export default {
  router: authRouter.router,
};
