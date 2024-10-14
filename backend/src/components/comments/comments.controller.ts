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
  }
}

export default CommentsController;
