import ResumenController from "./resumen.controller";
import ResumenRouter from "./resumen.router";
import ResumenService from "./resumen.service";
import ResumenSerivce from "./resumen.service";




const resumenService = new ResumenService()
const resumenController = new ResumenController(resumenService)
const resumenRouter = new ResumenRouter(resumenController)




export default {
  router: resumenRouter.router
}

