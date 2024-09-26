import { Request, Response } from "express";
import CommentsService from "./comments.services";

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
}

export default CommentsController;
