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

const getBaseURL = () => {
  const viteEnv =
    (typeof import.meta !== "undefined" && (import.meta as any).env) || {};
  if (viteEnv?.VITE_API_URL) {
    return String(viteEnv.VITE_API_URL).replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/$/, "");
    const isLocalVite =
      /^http:\/\/(localhost|127\.0\.0\.1):5173$/i.test(origin) ||
      /^http:\/\/(?:192\.168|10)\.\d+\.\d+:5173$/i.test(origin);

    if (!isLocalVite) {
      return `${origin}/api`;
    }
  }

  return "https://balticherkutback.onrender.com/api";
};

// normalize Accept-Language до en/ru/fi
const normalizeLang = (raw?: string) => {
  const v = (raw || "").toLowerCase();
  const short = v.split(",")[0].trim().slice(0, 2);
  return (["en", "ru", "fi"].includes(short) ? short : "en") as
    | "en"
    | "ru"
    | "fi";
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
  withCredentials: true,
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
  const isFD =
    typeof FormData !== "undefined" && config.data instanceof FormData;
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

// ===== Interceptors =====
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const rawToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const token =
      rawToken && !/^(\s*|null|undefined)$/i.test(rawToken) ? rawToken : null;

    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    if (config.headers && !(config.headers as any)["Accept-Language"]) {
      (config.headers as any)["Accept-Language"] = getCurrentLang();
    }

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
