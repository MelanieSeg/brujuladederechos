import CommentsController from "./comments.controller";
import CommentsService from "./comments.services";
import AuthMiddleware from "../auth/auth.middleware";
import AuthService from "../auth/auth.service";
import CommentsRouter from "./comments.router";
import CommentsConsumer from "./comments.consumer";
import ibfRoutes from "./ibfRoutes";  // Importa el router de ibfRoutes
import NotificationsService from "../notifications/notifications.services";

const commentsService = new CommentsService();
const notificationService = new NotificationsService();
const commentsController = new CommentsController(commentsService);
const commentsRouter = new CommentsRouter(commentsController);
const commentsConsumer = new CommentsConsumer(commentsService, notificationService);

const initialize = async () => {
    try {
        await commentsConsumer.connect();
        console.log("CommentsConsumer conectado y escuchando RabbitMQ");
    } catch (err) {
        console.log("Error al iniciar el CommentsConsumer: ", err);
    }
};

// Añadir la ruta IBF al router de comentarios
commentsRouter.router.use('/ibf', ibfRoutes);

export default {
    router: commentsRouter.router,
    initialize,
};