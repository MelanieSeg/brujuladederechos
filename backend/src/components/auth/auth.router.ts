import express from "express";
import AuthController from "./auth.controller";

class AuthRouter {
  private AuthController: AuthController;
  constructor(authController: AuthController) {
    this.AuthController = authController;
  }

  get router() {
    const router = express.Router();
    router.route("/login").post(this.AuthController.sigIn);
    router.route("/logout").post(this.AuthController.logout);
    router
      .route("/refresh-token")
      .post(this.AuthController.getRefreshTokenFromCookie);
    return router;
  }
}

export default AuthRouter;
