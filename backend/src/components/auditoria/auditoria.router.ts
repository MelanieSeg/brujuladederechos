import express from 'express'
import AuditoriaController from './auditoria.controller'


//TODO: agregar el AuthMiddleware para manejar permisos de acceso
class AuditoriaRouter {

  constructor(private auditoriaController: AuditoriaController) {

  }


  get router() {

    const router = express.Router()

    router.route("/get-data").get(this.auditoriaController.getAllData)



    return router
  }
}


export default AuditoriaRouter
