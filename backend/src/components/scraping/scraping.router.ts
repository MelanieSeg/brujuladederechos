import express, { Request, Response } from "express";
import AuthMiddleware from "../auth/auth.middleware";
import ScrapingController from "./scraping.controller";

class ScrapingRouter {
  private ScrapingController: ScrapingController;
  private AuthMiddleware: AuthMiddleware;
  constructor(
    scrapingController: ScrapingController,
    authMiddleware: AuthMiddleware,
  ) {
    this.ScrapingController = scrapingController;
    this.AuthMiddleware = authMiddleware;
  }

  get router() {
    const router = express.Router();

    //   router.route("/scraping-emol").post(this.ScrapingController.addComment);

    router.post(
      "/scraping-emol",
      this.AuthMiddleware.authorize,
      this.ScrapingController.addComment,
    );
    return router;
  }
}

export default ScrapingRouter;
