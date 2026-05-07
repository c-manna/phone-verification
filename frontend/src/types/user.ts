export interface User {
  id: string;
  name: string;
  phone: string;
  isPhoneVerified: boolean;
}

export interface RegisterResponse {
  success: true;
  token: string;
  user: User;
}

export interface MeResponse {
  success: true;
  user: User;
}

export interface VerifyResponse {
  success: true;
  message: string;
  user: {
    id: string;
    phone: string;
    isPhoneVerified: boolean;
  };
}
