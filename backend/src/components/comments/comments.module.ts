import CommentsController from "./comments.controller";
import CommentsService from "./comments.services";
import AuthMiddleware from "../auth/auth.middleware";
import AuthService from "../auth/auth.service";
import CommentsRouter from "./comments.router";

const commentsService = new CommentsService();
const commentsController = new CommentsController(commentsService);
const commentsRouter = new CommentsRouter(commentsController);

export default {
  router: commentsRouter.router,
};
