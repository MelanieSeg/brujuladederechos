import { PrismaClient, TipoNotificacion, TipoToken, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateRandomToken } from "../../utils";
import EmailService from "../email/email.service";
import { UpdateUserDto, UserChangePasswordDto, UserChangeStateDto, UserNewPasswordDto, UserUpdateData } from "../../schemas/user";
import CloudinaryService from "../cloudinary/cloudinary.services";

class UserService {
  private prisma: PrismaClient;
  private EmailService: EmailService;
  private cloudService: CloudinaryService
  constructor(emailService: EmailService, CloudinaryService: CloudinaryService) {
    this.prisma = new PrismaClient();
    this.EmailService = emailService;
    this.cloudService = CloudinaryService
  }

  addUser = async (user: User, adminId: string) => {
    const SALT_ROUNDS = 10;

    try {

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


      const auditoriaLog = await this.prisma.auditoria.create({
        data: {
          usuarioId: adminId,
          tipoAccion: "CREAR_USUARIO",
          entidad: "User",
          entidadId: newUser.id,
          detalles: null
        }
      })

      const { password, ...userNoPassword } = newUser;

      //TODO: Arreglar esto , validar que el correo se envio exitosamente, manejo de errores en caso de que no
      await this.EmailService.sendEmailVerification({
        userEmail: userNoPassword.email,
        userName: userNoPassword.name!!,
        rol: userNoPassword.rol,
        id: userNoPassword.id,
      });

      return userNoPassword;

    } catch (err) {
      return err
    }
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

  changePassword = async (userChangePasswordDto: UserChangePasswordDto) => {
    try {

      const validateUser = await this.prisma.user.findUnique({
        where: {
          id: userChangePasswordDto.userId
        }
      })

      if (!validateUser) {
        return {
          success: false,
          message: "Usuario invalido o no existe"
        }
      }

      const validatePassword = await bcrypt.compare(userChangePasswordDto.currentPassword, validateUser.password)

      if (!validatePassword) {
        return {
          success: false,
          message: "La Password ingresada el invalida"
        }
      }

      const SALT_ROUNDS = 10;
      const salt = bcrypt.genSaltSync(SALT_ROUNDS);

      const hashedNewPassword = await bcrypt.hash(userChangePasswordDto.newPassword, salt);


      await this.prisma.user.update({
        where: {
          id: validateUser.id
        },
        data: {
          password: hashedNewPassword
        }
      })
      /*
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
      */
      return {
        success: true,
        msg: "Cambio de password completada con exito",
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
      where: {
        isDelete: false
      }
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

  changeUserState = async (userChangeStateDto: UserChangeStateDto, adminId: string) => {
    try {
      const user = await this.getUserById(userChangeStateDto.id);


      if (!user) {
        return { success: false, data: null, message: `Error, el usuario con el id ${userChangeStateDto.id} no fue encontrado` };
      }

      if (user?.id === adminId) {
        return {
          success: false,
          data: null,
          message: `Error, esta operacion no es permitida`
        }
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
      const auditoria = await this.prisma.auditoria.create({
        data: {
          usuarioId: adminId,
          tipoAccion: "DESACTIVAR_USUARIO",
          entidad: "User",
          entidadId: deactivatedUser.id,
          detalles: null
        }
      })

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
          isDelete: true,
          isActive: false,
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

  uploadUserProfilePicture = async (file: Express.Multer.File, publicId: string) => {
    return this.cloudService.uploadImage(file, publicId)
  }

  updateUserProfilePicture = async (userId: string, imageUrl: string) => {
    try {
      const user = await this.getUserById(userId)

      if (!user) {
        return {
          success: false,
          message: 'El usuario no existe'
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          image: imageUrl
        }
      })

      return {
        success: true,
        message: 'Imagen Actualizada exitosamente'
      }

    } catch (err) {
      return {
        success: false,
        message: err
      }

    }
  }


  getUserNotifications = async (userId: string) => {

    try {

      const user = this.getUserById(userId);

      if (!user) {
        return {
          message: "Usuario no encontrado",
          success: false,
          data: null
        }
      }


      const [userGlobalNotifcations, userIndividualNotifications] = await Promise.all([
        this.prisma.notification.findMany({

          where: {
            type: "GLOBAL",
            userNotifications: {
              none: {
                userId: userId,
              }
            }
          }
        }),
        this.prisma.userNotifications.findMany({
          where: {
            isRead: false,
            userId: userId
          }, include: {
            notification: true
          }
        })

      ])
      const comentariosNoLeidos = [
        ...userGlobalNotifcations,
        ...userIndividualNotifications.map((n) => n.notification),
      ];


      return {
        message: "Se obtuvieron todas las notificaciones del usuario ",
        success: true,
        data: comentariosNoLeidos
      }

    } catch (err) {
      return {
        message: err,
        success: false,
        data: null
      }
    }
  }

  markNotificationAsRead = async (notificationId: string, userId: string) => {
    try {

      const notification = await this.prisma.notification.findUnique({
        where: {
          id: notificationId,
        }
      })

      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      })


      if (!user) {
        return {
          success: false,
          msg: "Error, no se pudo realizar la accion"
        }
      }

      if (notification?.type === TipoNotificacion.GLOBAL) {
        await this.prisma.userNotifications.create({
          data: {
            notificationId: notificationId,
            userId: user.id,
            isRead: true,
          }
        })
      } else {
        await this.prisma.userNotifications.update({
          where: {
            id: notificationId,
            isRead: false
          },
          data: {
            isRead: true
          }
        })
      }


      return {
        success: true,
        msg: "Se completo la accion de leer la notificacion con exito"
      }

    } catch (err) {
      return {
        success: false,
        msg: err
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
