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

    router.post("/create-user", this.AuthMiddleware.authorize, this.AuthMiddleware.authorizeRole(["ADMIN"]), this.UserController.createUser);
    router.patch("/update-user/id/:id", this.AuthMiddleware.authorize, this.AuthMiddleware.authorizeRole(["ADMIN"]), this.UserController.updateUserData);
    router.patch("/deactivate-user", this.AuthMiddleware.authorize, this.AuthMiddleware.authorizeRole(["ADMIN"]), this.UserController.changeUserState)
    router.patch(
      "/delete-user",
      this.AuthMiddleware.authorize,
      this.AuthMiddleware.authorizeRole(["ADMIN"]),
      this.UserController.deleteUser
    )
    router.post('/upload-image', upload.single('image'), this.AuthMiddleware.authorize, this.UserController.uploadImage)
    router.post('/get-user-notifications', this.AuthMiddleware.authorize, this.UserController.getUserNotifications)
    router.post("/reset-password", this.AuthMiddleware.authorize, this.UserController.resetPasswordUser);
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
      this.AuthMiddleware.authorize,
      this.UserController.changeUserPassword
    )

    return router;
  }
}

export default UserRouter;
