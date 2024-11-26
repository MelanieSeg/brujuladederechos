import { PrismaClient } from "@prisma/client";



class AuditoriaService {
  private prisma: PrismaClient
  constructor() {
    this.prisma = new PrismaClient()
  }



  getAll = async () => {
    return await this.prisma.auditoria.findMany({
      include: {
        usuario: {
          select: {
            name: true,
            rol: true
          }
        }
      }
    })
  }
}


export default AuditoriaService;
