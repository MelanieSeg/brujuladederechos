import { PrismaClient, TipoToken, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import * as jose from "jose";
import dotenv from "dotenv";
import { isValid } from "zod";
import { IUser } from "../../models/user";
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

//TODO: manejar mejor la crear de un new Prisma Client

dotenv.config();

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "SECRET_KEY");
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "REFRESH_SECRET_KEY",
);
const ALGORITMO = "HS256";
const EXP_HORA = "2h";
const REFRESH_EXP_DAYS = 7;

interface CustomJWTPayload extends jose.JWTPayload {
  userId: string;
}

interface VerifyRefreshTokenResponse {
  isValid: boolean;
  payload: CustomJWTPayload | null;
  msg: string;
}
export interface IUserTokenPayload extends jose.JWTPayload {
  userId: string;
  email: string;
  rol: string;
  iat: number;
  exp: number;
}

type VerifyTokenResult =
  | { isValid: true; payload: IUserTokenPayload }
  | { isValid: false; payload: null };

class AuthService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  login = async (user: User, password: string) => {
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return {
        isValid: false,
        accessToken: null,
        refreshToken: null,
      };
    }

    await this.deleteRefreshTokens(user.id)

    const jwt = await new jose.SignJWT({
      userId: user.id,
      email: user.email,
      rol: user.rol,
    })
      .setProtectedHeader({ alg: ALGORITMO })
      .setIssuedAt()
      .setExpirationTime(EXP_HORA)
      .sign(SECRET);

    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      isValid: matchPassword,
      accessToken: jwt,
      refreshToken: refreshToken,
    };
  };

  generateResetPasswordToken = async (email: string) => {
    const user = await this.prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    //generar token único
    const token = randomBytes(32).toString('hex');
    //guardar token con fecha de expiración (1 hora)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hora desde ahora
      }
    });

    return token;
  };

  sendResetPasswordEmail = async (email: string, token: string) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // O tu servicio de correo
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // URL de restablecimiento
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    // Opciones de correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restablecimiento de contraseña',
      html: `
        <h1>Restablecimiento de contraseña</h1>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este enlace expirará en 1 hora.</p>
      `
    };

    // Enviar correo
    await transporter.sendMail(mailOptions);
  };

  validateResetPasswordToken = async (token: string, newPassword: string) => {
    // Buscar usuario con token válido
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return { 
        success: false, 
        message: 'Token inválido o expirado' 
      };
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    return { 
      success: true, 
      message: 'Contraseña restablecida exitosamente' 
    };
  };

  generateRefreshToken = async (userId: string) => {
    const refreshToken = await new jose.SignJWT({ userId })
      .setProtectedHeader({ alg: ALGORITMO })
      .setIssuedAt()
      .setExpirationTime(`${REFRESH_EXP_DAYS}d`)
      .sign(REFRESH_SECRET);

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + REFRESH_EXP_DAYS);

    await this.prisma.userToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expireAt: expireAt,
        tipo: TipoToken.REFRESH
      },
    });

    return refreshToken;
  };

  refreshAccessToken = async (refreshToken: string) => {
    try {
      const { payload } = await jose.jwtVerify<CustomJWTPayload>(
        refreshToken,
        REFRESH_SECRET,
      );

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (!user) {
        return {
          isValid: false,
          payload: null,
          msg: "Token ingresado es invalido, no se puede encontrar el usuario",
        };
      }

      const existTokenInDB = await this.prisma.userToken.findUnique({
        where: {
          token: refreshToken,
        },
      });

      if (!existTokenInDB || existTokenInDB.tipo !== TipoToken.REFRESH) {
        return { isValid: false, payload: null, msg: "RefreshToken no valido" };
      }

      if (existTokenInDB.expireAt < new Date()) {
        await this.prisma.userToken.delete({
          where: {
            token: refreshToken,
          },
        });
        return { isValid: false, payload: null, msg: "RefreshToken ha expirado" };
      }

      const newAccessToken = await new jose.SignJWT({
        userId: user.id,
        email: user?.email,
        rol: user?.rol,
      })
        .setProtectedHeader({ alg: ALGORITMO })
        .setIssuedAt()
        .setExpirationTime(EXP_HORA)
        .sign(SECRET);

      return {
        isValid: true,
        accessToken: newAccessToken,
      };
    } catch (err) {
      return { isValid: false, payload: null, msg: err };
    }
  };

  deleteRefreshTokens = async (userId: string) => {
    await this.prisma.userToken.deleteMany({
      where: {
        userId: userId,
        tipo: TipoToken.REFRESH
      },
    });
  };

  logout = async (userId: string) => {
    await this.deleteRefreshTokens(userId);
  };

  cleanExpiredTokens = async () => {
    await this.prisma.userToken.deleteMany({
      where: {
        expireAt: {
          lt: new Date(),
        },
      },
    });

    return { msg: "Se han eliminado todos los refreshTokens expirados" };
  };

  verifyToken = async (jwt: string): Promise<VerifyTokenResult> => {
    try {
      const validatedToken = await jose.jwtVerify<IUserTokenPayload>(jwt, SECRET);
      return { isValid: true, payload: validatedToken.payload };
    } catch (err) {
      return { isValid: false, payload: null };
    }
  };

  verifyRefreshToken = async (
    refreshToken: string,
  ): Promise<VerifyRefreshTokenResponse> => {
    try {
      const validateRefreshToken = await jose.jwtVerify<CustomJWTPayload>(
        refreshToken,
        REFRESH_SECRET,
      );

      const validateExistToken = await this.prisma.userToken.findUnique({
        where: {
          token: refreshToken,
        },
      });

      if (!validateExistToken || validateExistToken.tipo !== TipoToken.REFRESH) {
        return {
          isValid: false,
          payload: null,
          msg: "No existe el refreshToken ingresado",
        };
      }

      if (validateExistToken.expireAt < new Date()) {
        await this.prisma.userToken.delete({
          where: {
            token: refreshToken,
          },
        });

        return {
          isValid: false,
          payload: null,
          msg: "RefreshToken ha expirado",
        };
      }

      return {
        isValid: true,
        payload: validateRefreshToken.payload,
        msg: "Operacion exitosa",
      };
    } catch (err) {
      return {
        isValid: false,
        payload: null,
        msg: "Error al verificar el refresh token",
      };
    }
  };
}

export default AuthService;
