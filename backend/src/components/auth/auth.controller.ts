import { Request, Response } from "express";

import AuthService from "./auth.service";
import UserService from "../user/user.service";
import { loginSchema } from "../../schemas/auth";

class AuthController {
  private AuhtService: AuthService;
  private UserSerive: UserService;
  constructor(authService: AuthService, userService: UserService) {
    this.AuhtService = authService;
    this.UserSerive = userService;
  }

  sigIn = async (req: Request, res: Response) => {
    try {
      const validData = loginSchema.safeParse(req.body);

      if (!validData.success) {
        return res
          .status(400)
          .json({ error: "Error, Ingresar todos los campos porfavor!" });
      }
      if (validData.data === undefined) {
        return res.status(401).send({ error: "Password incorrecta" });
      }
      const { email, password } = validData.data;

      const validUser = await this.UserSerive.getUserbyEmail(email);
      if (!validUser) {
        return res
          .status(404)
          .json({ error: `No existe un usuario con ${email} como email` });
      }

      if (!validUser.emailVerified) {
        await this.UserSerive.resendConfirmationEmailToken(validUser.email);
        return res.status(403).json({
          error: `Tu email no esta verificado, se a reenviado un token a ${validUser.email}`,
        });
      }

      if (!validUser.isActive) {
        return res.status(403).json({
          error: "Tu cuenta está desactivada y no puedes acceder a la aplicación."
        });
      }

      const { isValid, accessToken, refreshToken } =
        await this.AuhtService.login(validUser, password);
      if (!isValid) {
        return res.status(401).send({ error: "Password incorrecta" });
      }

      const { password: _, ...userNoPassword } = validUser;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // por la duda esto es 7 dias en milisegundos ;)
      });

      return res.status(200).send({ accessToken, user: userNoPassword });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Error interno del servidor 1" });
    }
  };

  getRefreshTokenFromCookie = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ msg: "No se proporciono el refreshToken" });
    }

    try {
      const { accessToken } =
        await this.AuhtService.refreshAccessToken(refreshToken);
      return res.json({ accessToken });
    } catch (err) {
      return res.status(401).json({
        msg: "Error interno del servidor al obtener el refreshToken desde las cookies",
      });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res
          .status(401)
          .json({ msg: "No se proporciono el refreshToken" });
      }
      const verificationResult =
        await this.AuhtService.verifyRefreshToken(refreshToken);
      if (!verificationResult.isValid || !verificationResult.payload?.userId) {
        return res
          .status(401)
          .json({ msg: "Refresh Token invalido o ha expirado" });
      }

      const userId = verificationResult.payload.userId;

      await this.AuhtService.logout(userId);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0
      });

      return res.status(200).json({ msg: "Cierre de sesion exitoso" });
    } catch (err) {
      return res.status(500).json({ msg: "Error interno del servidor" });
    }
  };

  sendResetPasswordEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //validar que el email existe
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Correo electrónico es requerido' 
        });
      }
      const user = await this.UserSerive.getUserbyEmail(email);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }

      //genera token de restablecimiento
      const token = await this.AuhtService.generateResetPasswordToken(email);

      //enviar correo electrónico
      await this.AuhtService.sendResetPasswordEmail(email, token);

      res.status(200).json({ 
        success: true, 
        message: 'Correo de recuperación enviado' 
      });
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Error al enviar correo de recuperación' 
      });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      // Validar token y cambiar contraseña
      const result = await this.AuhtService.validateResetPasswordToken(token, newPassword);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Error al restablecer contraseña' 
      });
    }
  };
  }

export default AuthController;
