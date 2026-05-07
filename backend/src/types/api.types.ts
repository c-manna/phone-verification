export interface HealthResponse {
  status: 'ok';
  message: string;
}

export interface RegisterResponse {
  success: true;
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    isPhoneVerified: boolean;
  };
}

export interface MeResponse {
  success: true;
  user: {
    id: string;
    name: string;
    phone: string;
    isPhoneVerified: boolean;
  };
}

export interface SendCodeResponse {
  success: true;
  message: string;
}

export interface VerifyCodeResponse {
  success: true;
  message: string;
  user: {
    id: string;
    phone: string;
    isPhoneVerified: boolean;
  };
}
