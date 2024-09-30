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

    return router;
  }
}

export default CommentsRouter;
