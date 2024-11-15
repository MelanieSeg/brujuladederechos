import { Request, Response, NextFunction } from "express";
import AuthService from "./auth.service";

//interface AuthRequest extends Request {
//user?: any;
//}

class AuthMiddleware {
  private AuthService: AuthService;
  constructor(authService: AuthService) {
    this.AuthService = authService;
  }

  authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        return res.status(401).send({ error: "No estas autorizado" });
      }

      const [bearer, token] = authorization.split(" ");
      if (bearer !== "Bearer") {
        return res.status(401).send({ error: "Unauthorized" });
      }
      const decodedToken = await this.AuthService.verifyToken(token);
      if (!decodedToken.isValid) {
        return res.status(401).send({ error: "Unauthorized" });
      }
      req.user = decodedToken.payload;
      next();
    } catch (err) {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  authorizeRole = (rules: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        if (!user) {
          return res.status(401).json({ error: "No estas autorizado" });
        }

        const userRole = user.rol;


        if (!rules.includes(userRole)) {
          return res
            .status(403)
            .json({ error: "No tienes permisos para acceder a este modulo" });
        }

        next();
      } catch (err) {
        return res.status(400).json({ error: "Error interno del servidor" });
      }
    };
  };
}

export default AuthMiddleware;
