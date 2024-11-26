import express from "express";
import UserController from "./user.controller";
import AuthMiddleware from "../auth/auth.middleware";
import upload from "../cloudinary/multer.middleware";
import { createUserLimiter, resetPasswordLimiter, uploadImageLimiter } from "../../config/rate-limit";

class UserRouter {
  private UserController: UserController;
  private AuthMiddleware: AuthMiddleware;
  constructor(userController: UserController, authMiddleware: AuthMiddleware) {
    this.UserController = userController;
    this.AuthMiddleware = authMiddleware;
  }

  get router() {
    const router = express.Router();

    router.post("/create-user", createUserLimiter, this.AuthMiddleware.authorize, this.AuthMiddleware.authorizeRole(["ADMIN"]), this.UserController.createUser);
    router.patch("/update-user/id/:id", this.AuthMiddleware.authorize, this.AuthMiddleware.authorizeRole(["ADMIN"]), this.UserController.updateUserData);
    router.patch("/deactivate-user", this.AuthMiddleware.authorize, this.AuthMiddleware.authorizeRole(["ADMIN"]), this.UserController.changeUserState)
    router.patch(
      "/delete-user",
      this.AuthMiddleware.authorize,
      this.AuthMiddleware.authorizeRole(["ADMIN"]),
      this.UserController.deleteUser
    )
    router.post('/upload-image', upload.single('image'), uploadImageLimiter, this.AuthMiddleware.authorize, this.UserController.uploadImage)
    router.post('/get-user-notifications', this.AuthMiddleware.authorize, this.UserController.getUserNotifications)
    router.post('/read-notification', this.AuthMiddleware.authorize, this.UserController.markNotificationAsRead)
    router.post("/reset-password", this.UserController.resetPasswordUser);
    router.route("/me").get(this.UserController.getUserById);
    router
      .route("/confirmar-usuario")
      .post(this.UserController.confirmEmailUser);
    router
      .route("/request-reset-password")
      .post(this.UserController.requestResetPassword);
    router.get(
      "/",
      this.AuthMiddleware.authorize,
      this.AuthMiddleware.authorizeRole(["ADMIN"]),
      this.UserController.getUsers,
    );
    router.get(
      "/:id",
      this.AuthMiddleware.authorize,
      this.UserController.getUserById,
    );
    router.patch(
      "/change-password",
      resetPasswordLimiter,
      this.AuthMiddleware.authorize,
      this.UserController.changeUserPassword
    )

    return router;
  }
}

export default UserRouter;
