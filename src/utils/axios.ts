// src/utils/axios.ts
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
    maxRetries?: number;
    public?: boolean;
  }
}

const getBaseURL = () => {
  const viteEnv =
    (typeof import.meta !== "undefined" && (import.meta as any).env) || {};
  if (viteEnv?.VITE_API_URL) {
    return String(viteEnv.VITE_API_URL).replace(/\/$/, "");
  }
  return "/api";
};

/** ========= i18n helpers ========= */
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
      const navLang = (navigator as any)?.language || (navigator as any)?.languages?.[0];
      if (navLang) return normalizeLang(navLang);
    }
  } catch {}
  return "en";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  withCredentials: false,
});

/** ========= de-dupe ========= */
const pendingMap = new Map<string, AbortController>();

const stableStringify = (obj: any): string => {
  if (obj == null) return "";
  if (typeof obj !== "object") return String(obj);
  const keys = Object.keys(obj).sort();
  return JSON.stringify(obj, keys);
};

const getDefaultReqKey = (config: InternalAxiosRequestConfig): string => {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";
  const paramsStr = stableStringify(config.params);
  const isFD = typeof FormData !== "undefined" && config.data instanceof FormData;
  const dataStr = isFD ? "" : stableStringify(config.data);
  return [method, url, paramsStr, dataStr].join("&");
};

const isIdempotent = (m?: string) =>
  ["get", "head", "options"].includes((m || "get").toLowerCase());

const shouldDedupe = (config: InternalAxiosRequestConfig) =>
  isIdempotent(config.method) || (config as any).dedupe === true;

/** ==== ГРАНУЛЯРНО: какие запросы публичные (без токена) ==== */
const cleanUrl = (u?: string) =>
  (u || "").replace(/^\/?api\/?/, "").replace(/^\//, "");

const isPublicRequest = (config: InternalAxiosRequestConfig & { public?: boolean }) => {
  if (config.public) return true;

  const method = (config.method || "get").toLowerCase();
  const url = cleanUrl(config.url);

  // Публичные только отдельные GET:
  if (method === "get") {
    // товары: список, поиск, id, категории, ensure-by-barcode
    if (
      /^products$/.test(url) ||
      /^products\/id\/[^/]+$/.test(url) ||
      /^products\/search/.test(url) ||
      /^products\/ensure-by-barcode\/[^/]+$/.test(url) ||
      // категории / подкатегории (GET)
      /^categories(\/.*)?$/.test(url) ||
      /^subcategories(\/.*)?$/.test(url) ||
      // страница "about"
      /^about(\/.*)?$/.test(url) ||
      // отзывы (если у тебя публичные GET)
      /^reviews(\/.*)?$/.test(url) ||
      // товары по категориям
      /^products\/[^/]+$/.test(url) ||
      /^products\/[^/]+\/[^/]+$/.test(url)
    ) {
      return true;
    }
  }

  // Пример публичного POST (если есть, оставь/убери по ситуации):
  if (method === "post" && /^orders\/email$/.test(url)) {
    return true;
  }

  // Всё остальное — НЕ публичное (нужен токен)
  return false;
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

/** ========= retry helpers ========= */
const parseRetryAfter = (hdr?: string | null) => {
  if (!hdr) return 0;
  const s = Number(hdr);
  return Number.isFinite(s) ? Math.max(0, s * 1000) : 0;
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const isNetworkTimeout = (err: AxiosError) =>
  err.code === "ECONNABORTED" || /timeout/i.test(err.message);

const isNetworkError = (err: AxiosError) =>
  !err.response || err.code === "ERR_NETWORK";

const isRetriableStatus = (status?: number) =>
  status === 429 || status === 503 || status === 504;

const shouldRetry = (
  error: AxiosError,
  cfg: InternalAxiosRequestConfig & { __retryCount?: number }
) => {
  const status = error.response?.status;
  if (!isIdempotent(cfg.method)) return false;
  if (isNetworkTimeout(error) || isNetworkError(error)) return true;
  if (isRetriableStatus(status)) return true;
  return false;
};

/** ========= interceptors ========= */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { public?: boolean }) => {
    if (config.headers && !(config.headers as any)["Accept-Language"]) {
      (config.headers as any)["Accept-Language"] = getCurrentLang();
    }

    const publicReq = isPublicRequest(config);

    if (!publicReq) {
      const rawToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const token =
        rawToken && !/^(\s*|null|undefined)$/i.test(rawToken) ? rawToken : null;
      if (token && config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } else if (config.headers && (config.headers as any).Authorization) {
      delete (config.headers as any).Authorization;
    }

    const isFD = typeof FormData !== "undefined" && config.data instanceof FormData;
    if (isFD && config.headers) delete (config.headers as any)["Content-Type"];
    if (!isFD && publicReq) {
      (config.headers as any)["Content-Type"] = "application/json";
    }

    (config as any).maxRetries ??= 2;

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
  async (error: AxiosError) => {
    const cfg = (error.config || {}) as InternalAxiosRequestConfig & {
      __retryCount?: number;
      maxRetries?: number;
      skipAuthRedirect?: boolean;
      public?: boolean;
    };

    removePending(cfg);

    if (
      (error as any).code === "ERR_CANCELED" ||
      (error as any).name === "CanceledError" ||
      error.message === "canceled"
    ) {
      return Promise.reject(error);
    }

    if (shouldRetry(error, cfg)) {
      cfg.__retryCount = (cfg.__retryCount || 0) + 1;
      const max = cfg.maxRetries ?? 2;

      if (cfg.__retryCount <= max) {
        const retryAfterHeader = error.response?.headers?.["retry-after"] as
          | string
          | undefined;
        const retryAfterMs = parseRetryAfter(retryAfterHeader ?? null);

        const backoff = retryAfterMs || Math.min(1500, 400 * 2 ** (cfg.__retryCount - 1));
        const jitter = Math.floor(Math.random() * 120);
        await sleep(backoff + jitter);

        addPending(cfg);
        return axiosInstance.request(cfg);
      }
    }

    if (error.response?.status === 401 && !cfg?.skipAuthRedirect && typeof window !== "undefined") {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
