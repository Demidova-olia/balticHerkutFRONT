import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    dedupe?: boolean;
    requestKey?: string;
    skipAuthRedirect?: boolean;
  }
}

// Базовый URL: сперва Vite env, затем origin + /api, и запасной дефолт
const getBaseURL = () => {
  const viteEnv =
    (typeof import.meta !== "undefined" && (import.meta as any).env) || {};
  if (viteEnv?.VITE_API_URL) return viteEnv.VITE_API_URL as string;

  if (typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/$/, "");
    return `${origin}/api`;
  }
  return "https://balticherkutback.onrender.com/api";
};

// нормализуем язык до en/ru/fi
const normalizeLang = (raw?: string) => {
  const v = (raw || "").toLowerCase();
  const short = v.split(",")[0].trim().slice(0, 2);
  return (["en", "ru", "fi"].includes(short) ? short : "en") as "en" | "ru" | "fi";
};

const getCurrentLang = (): "en" | "ru" | "fi" => {
  try {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("i18nextLng");
      if (fromStorage) return normalizeLang(fromStorage);

      const htmlLang = document?.documentElement?.lang;
      if (htmlLang) return normalizeLang(htmlLang);

      const navLang =
        (navigator as any)?.language || (navigator as any)?.languages?.[0];
      if (navLang) return normalizeLang(navLang);
    }
  } catch {}
  return "en";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true, // можно оставить включенным
});

const pendingMap = new Map<string, AbortController>();

const stableStringify = (obj: any): string => {
  if (obj == null) return "";
  if (typeof obj !== "object") return String(obj);
  const keys = new Set<string>();
  JSON.stringify(obj, (k, v) => (keys.add(k), v));
  const sorted = Array.from(keys).sort();
  return JSON.stringify(obj, sorted);
};

const getDefaultReqKey = (config: InternalAxiosRequestConfig): string => {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";
  const paramsStr = stableStringify(config.params);
  const isFD = typeof FormData !== "undefined" && config.data instanceof FormData;
  const dataStr = isFD ? "" : stableStringify(config.data);
  return [method, url, paramsStr, dataStr].join("&");
};

const shouldDedupe = (config: InternalAxiosRequestConfig) => {
  const method = (config.method || "get").toLowerCase();
  return method === "get" || (config as any).dedupe === true;
};

const addPending = (config: InternalAxiosRequestConfig) => {
  if ((config as any).signal) return;
  if (!shouldDedupe(config)) return;

  const key = (config as any).requestKey || getDefaultReqKey(config);
  const prev = pendingMap.get(key);
  if (prev) prev.abort();

  const controller = new AbortController();
  (config as any).signal = controller.signal;
  (config as any)._reqKey = key;
  pendingMap.set(key, controller);
};

const removePending = (config?: InternalAxiosRequestConfig) => {
  if (!config) return;
  const key = (config as any)._reqKey || getDefaultReqKey(config);
  if (pendingMap.has(key)) pendingMap.delete(key);
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // auth
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // локализация: только Accept-Language (без X-Client-Lang, чтобы не триггерить preflight)
    if (config.headers && !(config.headers as any)["Accept-Language"]) {
      const lang = getCurrentLang();
      (config.headers as any)["Accept-Language"] = lang;
    }

    // FormData — пусть axios сам выставит boundary
    const isFD =
      typeof FormData !== "undefined" && config.data instanceof FormData;
    if (isFD && config.headers) {
      delete (config.headers as any)["Content-Type"];
    }

    addPending(config);
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    removePending(response.config as InternalAxiosRequestConfig);
    return response;
  },
  (error: AxiosError) => {
    removePending(error.config as InternalAxiosRequestConfig);

    if (
      (error as any).code === "ERR_CANCELED" ||
      (error as any).name === "CanceledError" ||
      error.message === "canceled"
    ) {
      return Promise.reject(error);
    }

    const skip = (error.config as any)?.skipAuthRedirect;
    if (error.response?.status === 401 && !skip) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
