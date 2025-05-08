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
  
    useEffect(() => {
      const savedToken = localStorage.getItem("token");
  
      if (savedToken && savedToken !== "undefined") {
        try {
          const decoded = jwtDecode<DecodedToken>(savedToken);
          console.log("Decoded token on load:", decoded);
          setToken(savedToken);
          setUser({
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
          });
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Error decoding token:", err);
          logout();
        }
      }
      setLoading(false);
    }, []);
  
    const login = async (email: string, password: string) => {
      const response = await axiosInstance.post("/users/login", {
        email,
        password,
      });
      console.log("Login response:", response.data);
  
      const { token } = response.data;
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded login token:", decoded);
  
      const user: User = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      };
      console.log("Logged in user:", user);
  
      localStorage.setItem("token", token);
  
      setToken(token);
      setUser(user);
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
  