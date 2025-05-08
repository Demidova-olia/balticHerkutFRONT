export interface User {
    id: string;
    username: string;
    email: string;
    role?: string;
  }
  
  export interface DecodedToken {
    id: string;
    username: string;
    email: string;
    role?: string;
    exp: number;
    iat: number;
  }
  
  export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
  }
  