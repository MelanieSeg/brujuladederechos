import { PrismaClient } from "@prisma/client";

class CommentsService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  getAllComments = async () => {
    try {
      const comments = await this.prisma.comentarioScraped.findMany();

      return {
        data: comments,
        msg: "Se obtuvieron los comentarios exitosamente",
      };
    } catch (err) {
      return { data: null, msg: err };
    }
  };
}

export default CommentsService;
