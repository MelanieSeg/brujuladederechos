import { on } from 'events'
import express from 'express'
import { changeUserConfigurationLimiter } from '../../config/rate-limit'
import AuthMiddleware from '../auth/auth.middleware'
import UserConfigurationController from './user-config.controller'


class UserConfigurationRouter {


  constructor(private userConfigurationController: UserConfigurationController,
    private authMiddleware: AuthMiddleware
  ) { }

  get router() {

    const router = express.Router()

    router.route("/get-configuration").get(this.userConfigurationController.getConfiguration)
    router.post("/change-configuration", changeUserConfigurationLimiter, this.authMiddleware.authorize, this.authMiddleware.authorizeRole(["ADMIN"]), this.userConfigurationController.setNewConfiguration)


    return router
  }
}



export default UserConfigurationRouter
