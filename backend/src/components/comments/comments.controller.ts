import { Request, Response } from "express";
import CommentsService from "./comments.services";
import { commentScrappedClassificationSchema } from "../../schemas/commentScrapped";



class CommentsController {
  private CommentsService: CommentsService;
  constructor(commentsService: CommentsService) {
    this.CommentsService = commentsService;
  }

  getAllComments = async (req: Request, res: Response) => {
    try {
      const data = await this.CommentsService.getAllComments();

      return res.status(200).json({ data: data.data, msg: data.msg });
    } catch (err) {
      return res.status(500).json({ msg: "Error interno del servidor" });
    }
  };

  getAllPendingComments = async (req: Request, res: Response) => {
    try {

      const data = await this.CommentsService.getAllCommentsPending();

      return res.status(200).json({
        data: data.data,
        msg: data.message
      })

    } catch (err) {
      return res.status(500).json({ msg: "Error interno del servidor" })
    }
  }

  getAllClassifiedComments = async (req: Request, res: Response) => {
    try {

      const response = await this.CommentsService.getAllClassifiedComments();

      if (!response) {
        return res.status(204).json({ data: null, msg: "No existen comentarios" })
      }

      return res.status(200).json({ data: response.data, msg: response.msg })

    } catch (err) {
      return res.status(500).json({ msg: "Error interno del servidor" })
    }
  }

  clasificateComment = async (req: Request, res: Response) => {
    try {
      console.log(req.body)
      const userId = req.body.userId;

      if (!userId) {
        return res.status(401).json({ msg: "Usuario no autenticado" });
      }

      const classificationData = req.body;
      const validationResult = commentScrappedClassificationSchema.safeParse(classificationData);

      if (!validationResult.success) {
        console.error("Errores de validación:", validationResult.error.errors);
        return res.status(400).json({ msg: "Datos de clasificación inválidos", errors: validationResult.error.errors });
      }

      const result = await this.CommentsService.manualClassificationComment(validationResult.data, userId);

      if (result.success) {
        return res.status(200).json({ data: result.data, msg: "Se a guardado exitosamene" });
      } else {
        return res.status(400).json({ msg: result.msg });
      }
    } catch (err) {
      console.error("Error en clasificateComment:", err);
      return res.status(500).json({ msg: "Error interno del servidor" });
    }
  };
}


export default CommentsController;
