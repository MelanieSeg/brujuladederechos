import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import * as jose from "jose";
import dotenv from "dotenv";
import { isValid } from "zod";

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

  generateRefreshToken = async (userId: string) => {
    const refreshToken = await new jose.SignJWT({ userId })
      .setProtectedHeader({ alg: ALGORITMO })
      .setIssuedAt()
      .setExpirationTime(`${REFRESH_EXP_DAYS}d`)
      .sign(REFRESH_SECRET);

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + REFRESH_EXP_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expireAt: expireAt,
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

      const existTokenInDB = await this.prisma.refreshToken.findUnique({
        where: {
          token: refreshToken,
        },
      });

      if (!existTokenInDB) {
        return { isValid: false, payload: null, msg: "RefreshToken no valido" };
      }

      // Verificar si el refreshToken esta expirado o no
      if (existTokenInDB.expireAt < new Date()) {
        await this.prisma.refreshToken.delete({
          where: {
            token: refreshToken,
          },
        });
      }

      //Generar un nuevo accessToken
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
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: userId,
      },
    });
  };

  logout = async (userId: string) => {
    await this.deleteRefreshTokens(userId);
  };

  cleanExpiredTokens = async () => {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expireAt: {
          lt: new Date(),
        },
      },
    });

    return { msg: "Se han eliminado todos los refreshTokens expirados" };
  };

  verifyToken = async (jwt: string) => {
    try {
      const validatedToken = await jose.jwtVerify(jwt, SECRET);
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

      const validateExistToken = await this.prisma.refreshToken.findUnique({
        where: {
          token: refreshToken,
        },
      });

      if (!validateExistToken) {
        return {
          isValid: false,
          payload: null,
          msg: "No existe el refreshToken ingresado",
        };
      }

      if (validateExistToken.expireAt < new Date()) {
        await this.prisma.refreshToken.delete({
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
