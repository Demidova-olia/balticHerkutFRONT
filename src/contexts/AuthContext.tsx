// src/contexts/AuthContext.tsx
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axiosInstance from "../utils/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
  AuthContextType,
  User,
  DecodedToken
} from "../types/authContextTypes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const buildUser = (decoded: DecodedToken): User => {
    const role = (decoded.role || "").toString().toLowerCase();
    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role,
    
      isAdmin: role === "admin" || decoded.isAdmin === true,
    };
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && savedToken !== "undefined") {
      try {
        const decoded = jwtDecode<DecodedToken>(savedToken);
        const built = buildUser(decoded);
        setToken(savedToken);
        setUser(built);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error decoding token:", err);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post("/users/login", { email, password });
    const { token } = response.data;

    const decoded = jwtDecode<DecodedToken>(token);
    const built = buildUser(decoded);

    localStorage.setItem("token", token);
    setToken(token);
    setUser(built);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log("👋 User logged out");
    toast.success("You have been logged out");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
