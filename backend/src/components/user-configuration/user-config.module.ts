import AuthMiddleware from "../auth/auth.middleware";
import AuthService from "../auth/auth.service";
import UserConfigurationController from "./user-config.controller";
import UserConfigurationRouter from "./user-config.router";
import UserConfigurationService from "./user-config.service";


const authService = new AuthService()
const authMiddleware = new AuthMiddleware(authService)
const userConfigurationService = new UserConfigurationService()
const userConfigurationController = new UserConfigurationController(userConfigurationService)
const userConfigurationRouter = new UserConfigurationRouter(userConfigurationController, authMiddleware)




export default {
  router: userConfigurationRouter.router
}
