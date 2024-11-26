import express from 'express'
import ResumenController from "./resumen.controller";


class ResumenRouter {
  constructor(private resumenController: ResumenController) { }



  get router() {
    const router = express.Router()

    router.route("/get-daily").get(this.resumenController.getDataResumenDiario)
    router.route("/get-week").get(this.resumenController.getDataResumenSemanal)
    router.route("/get-month").get(this.resumenController.getDataResumenMensual)
    router.route("/get-anual").get(this.resumenController.getDataResumenAnual)


    return router;
  }
}


export default ResumenRouter;
