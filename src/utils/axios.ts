import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const getBaseURL = () => {
  // Vite env в браузере
  if (
    typeof import.meta !== "undefined" &&
    typeof import.meta.env !== "undefined" &&
    (import.meta as any).env?.VITE_API_URL
  ) {
    return (import.meta as any).env.VITE_API_URL as string;
  }

  // Node/Jest
  if (process.env.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }

  // Фолбек на Render
  return "https://balticherkutback.onrender.com/api";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  // не задаём Content-Type по умолчанию — пусть axios сам решает (JSON vs FormData)
});

// request interceptor: добавить Bearer и не мешать FormData
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // auth
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }

    // если отправляем FormData — убираем вручную выставленный Content-Type (если где-то был)
    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
    if (isFormData && config.headers) {
      delete (config.headers as any)["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// response interceptor: 401 → logout
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
