import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateRandomToken } from "../../utils";
import EmailService from "../email/email.service";
import { isValid } from "zod";

class UserService {
  private prisma: PrismaClient;
  private EmailService: EmailService;
  constructor(emailService: EmailService) {
    this.prisma = new PrismaClient();
    this.EmailService = emailService;
  }

  addUser = async (user: User) => {
    const SALT_ROUNDS = 10;
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);

    const hashedPassword = await bcrypt.hash(user.password, salt);
    const newUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        rol: user.rol,
      },
    });

    const { password, ...userNoPassword } = newUser;

    //TODO: Arreglar esto , validar que el correo se envio exitosamente, manejo de errores en caso de que no
    await this.EmailService.sendEmailVerification({
      userEmail: userNoPassword.email,
      userName: userNoPassword.name!!,
      rol: userNoPassword.rol,
      id: userNoPassword.id,
    });

    return userNoPassword;
  };

  confirmEmail = async (token: string) => {
    try {
      const validConfirmToken = await this.prisma.token.findUnique({
        where: {
          token: token,
          expireAt: {
            gt: new Date(),
          },
        },
      });

      if (!validConfirmToken) {
        return { success: false };
      }

      const findUser = await this.prisma.user.findFirst({
        where: {
          id: validConfirmToken?.userId,
        },
      });

      if (!findUser) {
        return { success: false };
      }

      await Promise.all([
        this.prisma.user.update({
          where: {
            id: findUser.id,
          },
          data: {
            emailVerified: new Date(),
          },
        }),
        this.prisma.token.delete({
          where: {
            id: validConfirmToken.id,
          },
        }),
      ]);

      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  resendConfirmationEmailToken = async (email: string) => {
    try {
      const userEmailExist = await this.getUserbyEmail(email);
      if (!userEmailExist) {
        return { success: false };
      }

      if (userEmailExist.emailVerified) {
        return { success: false };
      }

      this.EmailService.sendEmailVerification({
        id: userEmailExist.id,
        userName: userEmailExist.name!!,
        userEmail: userEmailExist.email,
        rol: userEmailExist.rol,
      });

      return {
        success: true,
        msg: `Correo de validacion enviado a ${userEmailExist.email}`,
      };
    } catch (err) {
      return { success: false };
    }
  };

  sendEmailResetPassword = async (email: string) => {
    try {
      const userEmailExist = await this.getUserbyEmail(email);
      if (!userEmailExist) {
        return { success: false };
      }

      if (!userEmailExist.emailVerified) {
        return { success: false };
      }

      this.EmailService.sendEmailResetPassword({
        id: userEmailExist.id,
        userName: userEmailExist.name!!,
        userEmail: userEmailExist.email,
      });

      return {
        success: true,
        msg: `Correo para recuperar password enviado a ${userEmailExist.email}`,
      };
    } catch (err) {
      return { success: false };
    }
  };

  restartPassword = async (token: string, newPassowrd: string) => {
    try {
      const validToken = await this.prisma.resetPassowrdToken.findUnique({
        where: {
          token: token,
          expireAt: {
            gt: new Date(),
          },
        },
      });

      if (!validToken) {
        return {
          success: false,
          msg: "El token no existe o ha expirado, vuelve a solicitar una restauracion de password",
        };
      }

      const findUser = await this.prisma.user.findFirst({
        where: {
          id: validToken.userId,
        },
      });

      if (!findUser) {
        return { success: false, msg: "Usuario no encontrado" };
      }

      const SALT_ROUNDS = 10;
      const salt = bcrypt.genSaltSync(SALT_ROUNDS);

      const hashedPassword = await bcrypt.hash(newPassowrd, salt);

      await Promise.all([
        this.prisma.user.update({
          data: {
            password: hashedPassword,
          },
          where: {
            id: findUser.id,
          },
        }),
        this.prisma.resetPassowrdToken.delete({
          where: {
            id: validToken.id,
          },
        }),
      ]);

      return {
        success: true,
        msg: "Restauracion de password completada con exito",
      };
    } catch (err) {
      return { success: false };
    }
  };

  getUsers = () =>
    this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        rol: true,
        name: true,
      },
    });

  getUserById = (id: string) =>
    this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

  getUserbyEmail = (email: string) =>
    this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
}

export default UserService;
