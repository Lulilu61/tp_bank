// POST /api/auth/register
export interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// POST /api/auth/login
export interface LoginBody {
  email: string;
  password: string;
}

// Response of POST /api/auth/login
export interface TokenResponse {
  token: string;
}