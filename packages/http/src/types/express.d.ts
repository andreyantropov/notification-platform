import { type UserContext } from "../interfaces/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

export {};
