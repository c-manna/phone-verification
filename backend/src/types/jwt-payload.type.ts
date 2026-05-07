export interface JwtPayloadType {
  sub: string;
  name: string;
  phone: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  phone: string;
  isPhoneVerified: boolean;
}

export interface UserApiResponse extends AuthenticatedUser {}

