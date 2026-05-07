import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserDocument } from '../models/user.model';
import type { JwtPayloadType } from '../types/jwt-payload.type';

export function createToken(user: UserDocument): string {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      name: user.name,
      phone: user.phone
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}

export function verifyToken(token: string): JwtPayloadType {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.verify(token, env.jwtSecret) as JwtPayload & JwtPayloadType;
}
