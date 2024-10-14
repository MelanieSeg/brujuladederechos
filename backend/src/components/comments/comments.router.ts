import express, { Request, Response } from "express";
import CommentsController from "./comments.controller";
import CommentsService from "./comments.services";

class CommentsRouter {
  private CommentsController: CommentsController;
  constructor(commentsController: CommentsController) {
    this.CommentsController = commentsController;
  }

  get router() {
    const router = express.Router();

    router.route("/get-all").get(this.CommentsController.getAllComments);
    router.route("/get-all-comments-scraped").get(this.CommentsController.getAllComments);
    router.route("/get-all-classified-comments").get(this.CommentsController.getAllClassifiedComments);
    //TODO: Terminar funcionalida de clasificacion manual
    router.route("/get-clasificate-comment").post(this.CommentsController.clasificateComment);
    return router;
  }
}

export default CommentsRouter;
