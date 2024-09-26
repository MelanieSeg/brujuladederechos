import ScrapingController from "./scraping.controller";
import ScrapingRouter from "./scraping.router";
import ScrapingService from "./scraping.service";
import AuthMiddleware from "../auth/auth.middleware";
import AuthService from "../auth/auth.service";

const authService = new AuthService();
const authMiddleware = new AuthMiddleware(authService);
const scrapingService = new ScrapingService();
const scrapingController = new ScrapingController(scrapingService);
const scrapingRouter = new ScrapingRouter(scrapingController, authMiddleware);

export default {
  router: scrapingRouter.router,
};
