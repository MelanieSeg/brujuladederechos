import { IUserTokenPayload } from "../../components/auth/auth.service";
import { IUser } from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUserTokenPayload;
    }
  }
}

