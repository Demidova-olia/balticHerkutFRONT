// src/types/authContextTypes.ts
export type User = {
  id: string;
  username: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
};

export type DecodedToken = {
  id: string;
  username: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};
