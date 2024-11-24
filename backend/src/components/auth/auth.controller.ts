import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
import * as jwt from 'jsonwebtoken';
import AuthService from "./auth.service";
import UserService from "../user/user.service";
import { loginSchema } from "../../schemas/auth";
import { transport } from '../../config/mailtrap';
import { generateRandomToken } from '../../utils';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

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

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      // Verificar si el usuario existe
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'No se encontró un usuario con este correo electrónico' 
        });
      }

      // Generar un token JWT para recuperación de contraseña
      const resetPasswordToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          purpose: 'password_reset' 
        },
        process.env.JWT_SECRET!, 
        { 
          expiresIn: '15m' 
        }
      );

      // Enviar correo con Mailtrap
      await transport.sendMail({
        from: '"Brújula de Derechos" <noreply@brujuladerechos.com>',
        to: email,
        subject: 'Restablecimiento de Contraseña',
        html: `
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="http://tu-frontend.com/reset-password?token=${resetPasswordToken}">
            Restablecer Contraseña
          </a>
          <p>Este enlace expirará en 15 minutos.</p>
        `
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico' 
      });
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al procesar la solicitud de restablecimiento de contraseña' 
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      // Verificar y decodificar el token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
          userId: string, 
          email: string,
          purpose: string 
        };

        // Verificar que el propósito del token sea para reseteo de contraseña
        if (decoded.purpose !== 'password_reset') {
          return res.status(400).json({ 
            success: false, 
            message: 'Token inválido' 
          });
        }
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token inválido o expirado' 
        });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword }
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Contraseña restablecida exitosamente' 
      });
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al restablecer la contraseña' 
      });
    }
  }
}

export default AuthController;
