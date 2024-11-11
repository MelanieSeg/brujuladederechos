import { Request, Response } from "express";

import UserService from "./user.service";
import { deleteUserByAdmin, userChangeStateSchema, userIdParamsSchema, userNewPasswordSchema, userResetPasswordSchema, userSchema, userUpdateSchema } from "../../schemas/user";
import { tokenSchema } from "../../schemas/token";


class UserController {
  private userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }
  /*
   * - [ ]  TODO: Cambiar los errores de !validData.success para entregar mas informacion util.
     - [ ]  TODO: Mostrar errores de zod.
   *
  */



  createUser = async (req: Request, res: Response) => {
    try {
      const validData = userSchema.safeParse(req.body);

      if (!validData.success) {
        return res.status(400).json({ error: "Datos ingresados invalidos" });
      }

      const emailInUse = await this.userService.getUserbyEmail(
        validData.data.email,
      );
      if (emailInUse) {
        return res
          .status(409)
          .json({ error: "Email ingresado ya esta registrado" });
      }

      const user = await this.userService.addUser(req.body);
      return res.status(201).json({
        msg: "Usuario creado exitosamente. Ahora tienes que confirmar tu email porfavor.",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  updateUserData = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const validData = userUpdateSchema.safeParse(req.body)
      if (!validData.success) {
        return res.status(400).json({ error: "Datos ingresados invalidos" });
      }

      const updatedUser = await this.userService.updateUserData(validData.data, id);

      return res.status(200).json({
        data: updatedUser.data,
        message: `Informacion de usuario actualizada con exito`
      })


    } catch (err) {
      //TODO:Cambirar los errores po expeciones
      return res.status(500).json({ error: `Error interno del servidor, ${err}` })
    }
  }

  changeUserState = async (req: Request, res: Response) => {
    try {

      const validData = userChangeStateSchema.safeParse(req.body);
      if (!validData.success) {
        return res.status(400).json({ error: "Datos ingresados invalidos" });
      }

      const data = await this.userService.changeUserState(validData.data)


      return res.status(200).json({
        message: `Se desactivo el acceso a el usuario: ${data.data?.name}`
      })


    } catch (err) {
      return res.status(500).json({ error: `Error interno del servidor, ${err}` })
    }
  }

  deleteUser = async (req: Request, res: Response) => {
    try {

      const user = req.user

      const validData = deleteUserByAdmin.safeParse(req.body);
      if (!validData.success) {
        return res.status(400).json({ error: "Datos ingresados invalidos" });
      }

      if (!user || user.rol !== "ADMIN" || user.userId === validData.data.userId) {
        return res.status(401).json({ error: "No estas autorizado para realizar userIdParamsSchemaesta operacion" })
      }

      const data = await this.userService.deleteUser(validData.data.userId);

      return res.status(200).json({
        message: `Se elimino el usuario: ${"tests"}`
      })

    } catch (err) {
      return res.status(500).json({ error: `Error interno del servidor, ${err}` })
    }
  }

  confirmEmailUser = async (req: Request, res: Response) => {
    try {
      console.log('Solicitud de confirmación recibida:', req.body);

      const validData = tokenSchema.safeParse(req.body);
      if (!validData.success) {
        console.error('Validación de token fallida:', validData.error);
        return res.status(400).json({ error: "Información inválida" });
      }

      console.log('Token validado:', validData.data.token);

      const confirmEmail = await this.userService.confirmEmail(validData.data.token);

      console.log('Resultado de confirmEmail:', confirmEmail);

      if (!confirmEmail.success) {
        console.error('Confirmación de email fallida para el token:', validData.data.token);
        return res.status(400).json({ error: "Código de confirmación inválido o expirado" });
      }

      console.log('Cuenta confirmada exitosamente para el token:', validData.data.token);
      return res.status(200).json({ msg: "Cuenta confirmada con exito" });
    } catch (err) {
      console.error('Error en confirmEmailUser:', err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

  };

  requestResetPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ error: "Informacion invalida, porfavor ingresa tu email" });
      }

      const findUserWithEmail = await this.userService.getUserbyEmail(email);
      if (!findUserWithEmail) {
        return res.status(400).json({
          error:
            "No existe una cuanta con el email ingresado, porfavor vuelve a intentar",
        });
      }

      await this.userService.sendEmailResetPassword(findUserWithEmail.email);

      return res.status(200).json({
        msg: `Se ha enviado un correo a ${findUserWithEmail.email} para comenzar con la restauracion de tu password `,
      });
    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  resetPasswordUser = async (req: Request, res: Response) => {
    try {


      const validData = userResetPasswordSchema.safeParse(req.body);

      if (!validData.success) {
        return res
          .status(400)
          .json({ error: `Informacion invalida, ${validData.error}` });
      }

      const resetPassword = await this.userService.restartPassword(
        validData.data.token,
        validData.data.password,
      );

      if (!resetPassword.success) {
        return res.status(500).json({
          error: `Error interno del servidor. Error al restaurar password, ${resetPassword.msg}`,
        });
      }

      return res.status(200).json({ msg: "Cambio de passord exitoso" });
    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor", err });
    }
  };

  changeUserPassword = async (req: Request, res: Response) => {
    try {

      const user = req.user;

      const validData = userNewPasswordSchema.safeParse(req.body);

      if (!validData.success) {
        return res
          .status(400)
          .json({ error: `Informacion invalida, ${validData.error}` });
      }

      if (!user) {
        return res.status(401).json({ error: "No estas autorizado para realizar userIdParamsSchemaesta operacion" })
      }

      const data = await this.userService.changePassword({ userId: user.userId, ...validData.data })

      return res.status(200).json({ msg: "Cambio de password exitoso" });

    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor", err });
    }
  }

  uploadImage = async (req: Request, res: Response) => {
    try {

      console.log(req.body)
      console.log(req.file)
      const file = req.file

      if (!file) {
        return res.status(400).json({ message: 'No se ha proporcionado archivo' });
      }

      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: 'No estas autorizado para cambiar la imagen de perfil' });
      }

      const publicId = `profile_${userId}`

      const uploadImageResult = await this.userService.uploadUserProfilePicture(file, publicId)

      if (!uploadImageResult.success || !uploadImageResult.url) {
        return res.status(500).json({ msg: uploadImageResult.message })
      }

      const updatePicture = await this.userService.updateUserProfilePicture(userId, uploadImageResult.url)

      return res.status(200).json({
        url: uploadImageResult.url,
        message: updatePicture.message
      })

    } catch (err) {
      return res.status(500).json({ msg: `Error interno del servidor, ${err}` })
    }
  }

  getUserNotifications = async (req: Request, res: Response) => {

    try {

      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: 'No estas autorizado para cambiar la imagen de perfil' });
      }

      const notifications = await this.userService.getUserNotifications(userId);


      return res.status(200).json({
        data: notifications.data
      })



    } catch (err) {
      return res.status(500).json({ msg: `Error interno del servidor, ${err}` })
    }
  }



  getUsers = async (_: Request, res: Response) => {
    try {
      const users = await this.userService.getUsers();
      return res.status(201).send(users);
    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      return res.status(201).send(user);
    } catch (err) {
      return res.status(200).json({ error: "Error interno del servidor" });
    }
  };

  getUserByEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await this.userService.getUserbyEmail(email);
      return res.status(201).send(user);
    } catch (err) {
      return res.status(200).json({ error: "Error interno del servidor" });
    }
  };
}

export default UserController;
