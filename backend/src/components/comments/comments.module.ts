import CommentsController from "./comments.controller";
import CommentsService from "./comments.services";
import AuthMiddleware from "../auth/auth.middleware";
import AuthService from "../auth/auth.service";
import CommentsRouter from "./comments.router";
import CommentsConsumer from "./comments.consumer";

const commentsService = new CommentsService();
const commentsController = new CommentsController(commentsService);
const commentsRouter = new CommentsRouter(commentsController);
const commentsConsumer = new CommentsConsumer(commentsService)


const initialize = async ()=>{
  try{
    await commentsConsumer.connect()
    console.log("CommentsConsumer conectado y escuchando RabbitMQ");
  }catch(err){
    console.log("Error al iniciar el CommentsConsumer: ",err)
  }
}

export default {
  router: commentsRouter.router,
  initialize,
};
