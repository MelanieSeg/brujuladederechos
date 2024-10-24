import { PrismaClient, TipoToken, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateRandomToken } from "../../utils";
import EmailService from "../email/email.service";
import { UpdateUserDto, UserChangeStateDto, UserUpdateData } from "../../schemas/user";

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
      const validConfirmToken = await this.prisma.userToken.findFirst({
        where: {
          token: token,
          tipo: TipoToken.VERIFICATION,
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
        this.prisma.userToken.delete({
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
      const validToken = await this.prisma.userToken.findUnique({
        where: {
          token: token,
          tipo: TipoToken.RESET_PASSWORD,
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
        this.prisma.userToken.delete({
          where: {
            id: validToken.id,
          },
        }),
        this.prisma.userToken.deleteMany({
          where: {
            userId: findUser.id,
            tipo: TipoToken.REFRESH
          }
        })
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
        emailVerified: true,
        isActive: true
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

  changeUserState = async (userChangeStateDto: UserChangeStateDto) => {
    try {
      const user = await this.getUserById(userChangeStateDto.id);

      if (!user) {
        return { success: false, data: null, message: `Error, el usuario con el id ${userChangeStateDto.id} no fue encontrado` };
      }

      //NOTA: El usuario no lo podemos eliminiar por que existen existe la posibilidad
      // de que este haya clasificado comentario por lo que no se puede eliminar de la base de datos
      // por lo que solo lo vamos a "desactivar" o quitar el accesso
      //
      const deactivatedUser = await this.prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          isActive: !userChangeStateDto.isActive
        }
      })

      //TODO: Aca hay que crear un registro de auditoria que al usuario "x" se le quito el acceso

      return {
        success: true,
        data: deactivatedUser,
        message: `Se elimino el acceso al usuario ${deactivatedUser.name}`
      }

    } catch (err) {
      return { success: false, data: null, message: "Error al intentar eliminar usuario" };
    }
  }

  deleteUser = async (userId: string) => {
    try {

      const user = await this.getUserById(userId);

      if (!user) {
        return { success: false, data: null, message: `Error, el usuario con el id ${userId} no fue encontrado` };
      }


      const deleteUser = await this.prisma.user.update({
        where: {
          id: user.id,
          isDelete: false,
        },
        data: {
          isDelete: true
        }
      })

      if (!deleteUser) {
        return { success: false, data: null, message: `Error, no se pude eliminar el usuario, puede que el usuario ingresado ya haya sido "eliminado"` };
      }

      return { success: true, data: deleteUser, message: `El usuario: ${deleteUser.name} ha sido eliminado exitosamente` };

    } catch (err) {
      return {
        success: false,
        data: null,
        message: `Error al intentar eliminar un usuario. ERROR: ${err}`
      }
    }
  }

  updateUserData = async (user: UpdateUserDto, id: string) => {
    try {
      const userExist = await this.getUserById(id);

      if (!userExist) {
        return {
          success: false,
          data: null,
          message: `El usuario con id: ${id} no fue encontrado`
        }
      }

      if (user.email) {
        const emailInUse = await this.getUserbyEmail(user.email);

        if (emailInUse && emailInUse.id !== userExist.id) {
          return {
            success: false,
            data: null,
            message: `El email ingresado ya esta en uso`
          }
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: {
          id: id
        },
        data: {
          ...user
        }
      })

      return {
        success: true,
        data: updatedUser,
        message: `Se actualizo la informacion del usuario: ${updatedUser.name} con exito`
      }

    } catch (err) {
      return {
        success: false,
        data: null,
        message: `Error interno al intentar realizar un UPDATE en la data del usuario: ${user.name}`
      }
    }
  }
}

export default UserService;
