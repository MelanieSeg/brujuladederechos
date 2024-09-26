import { Request, Response } from "express";

import UserService from "./user.service";
import { userResetPasswordSchema, userSchema } from "../../schemas/user";
import { tokenSchema } from "../../schemas/token";

class UserController {
  private userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

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

  confirmEmailUser = async (req: Request, res: Response) => {
    try {
      const validData = tokenSchema.safeParse(req.body);
      if (!validData.success) {
        return res.status(400).json({ error: "Informacion invalida" });
      }

      const confirmEmail = await this.userService.confirmEmail(
        validData.data.token,
      );

      if (!confirmEmail.success) {
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      return res.status(200).json({ msg: "Cuenta confirmada con exito" });
    } catch (err) {
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
