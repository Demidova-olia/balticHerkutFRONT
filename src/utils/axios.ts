import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const getBaseURL = () => {
  // В браузере с Vite import.meta.env доступен, но Jest / Node - нет
  if (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // В Node.js (включая Jest) используем process.env
  if (process.env.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }

  // Фолбек
  return "https://balticherkutback.onrender.com/api";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
