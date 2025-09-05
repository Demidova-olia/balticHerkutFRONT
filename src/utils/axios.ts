// src/utils/axios.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const getBaseURL = () => {
  if (
    typeof import.meta !== "undefined" &&
    typeof import.meta.env !== "undefined" &&
    (import.meta as any).env?.VITE_API_URL
  ) {
    return (import.meta as any).env.VITE_API_URL as string;
  }
  if (process.env.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }
  return "https://balticherkutback.onrender.com/api";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    // Если FormData — не трогаем Content-Type
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;
    if (isFormData && config.headers) {
      delete (config.headers as any)["Content-Type"];
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
