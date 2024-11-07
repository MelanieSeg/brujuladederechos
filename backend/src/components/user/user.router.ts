import express from "express";
import UserController from "./user.controller";
import AuthMiddleware from "../auth/auth.middleware";
import upload from "../cloudinary/multer.middleware";

class UserRouter {
  private UserController: UserController;
  private AuthMiddleware: AuthMiddleware;
  constructor(userController: UserController, authMiddleware: AuthMiddleware) {
    this.UserController = userController;
    this.AuthMiddleware = authMiddleware;
  }

  get router() {
    const router = express.Router();

    router.route("/create-user").post(this.UserController.createUser);
    router.route("/update-user/id/:id").patch(this.UserController.updateUserData);
    router.route("/deactivate-user").patch(this.UserController.changeUserState)
    router.patch(
      "/delete-user",
      this.AuthMiddleware.authorize,
      this.AuthMiddleware.authorizeRole(["ADMIN"]),
      this.UserController.deleteUser
    )

    router.post('/upload-image', upload.single('image'), this.AuthMiddleware.authorize, this.UserController.uploadImage)
    router.route("/me").get(this.UserController.getUserById);
    router
      .route("/confirmar-usuario")
      .post(this.UserController.confirmEmailUser);
    router
      .route("/request-reset-password")
      .post(this.UserController.requestResetPassword);
    router.route("/reset-password").post(this.UserController.resetPasswordUser);
    // Rutas protegidas (requieren autenticación)
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
      this.AuthMiddleware.authorize,
      this.UserController.changeUserPassword
    )

    return router;
  }
}

export default UserRouter;
