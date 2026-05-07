import type { AuthenticatedUser, JwtPayloadType } from './jwt-payload.type';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayloadType;
      user?: AuthenticatedUser;
      validatedBody?: unknown;
    }
  }
}

export {};
