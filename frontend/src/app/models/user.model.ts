export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    token: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    role?: 'USER' | 'ADMIN';
    id?: string;
    type?: string | null;
  };
  token?: string;
  username?: string;
  role?: 'USER' | 'ADMIN';
  timestamp?: string;
}
