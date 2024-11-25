import AuditoriaController from "./auditoria.controller";
import AuditoriaRouter from "./auditoria.router";
import AuditoriaService from "./auditoria.service";



const auditoriaService = new AuditoriaService()
const auditoriaController = new AuditoriaController(auditoriaService)
const auditoriaRouter = new AuditoriaRouter(auditoriaController)

export default {
  router: auditoriaRouter.router
}
