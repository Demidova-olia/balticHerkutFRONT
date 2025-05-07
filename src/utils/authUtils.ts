import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string;
  email?: string;
  exp: number;
}

export const getDecodedToken = (): DecodedToken | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export const isTokenExpired = (): boolean => {
  const decoded = getDecodedToken();
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
};

export const isAuthenticated = (): boolean => {
  return !isTokenExpired();
};
