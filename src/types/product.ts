import { Category } from "./category";
import { Subcategory } from "./subcategory";

/* ============================================================================
 * i18n
 * ========================================================================== */

export type Lang = "en" | "ru" | "fi";

export interface LocalizedString {
  ru?: string;
  en?: string;
  fi?: string;
  /** исходный язык, из которого делали переводы */
  _source?: Lang;
  /** отметки, какие языки машинно переведены и т.п. */
  _mt?: Record<string, boolean>;
}

export type LocalizedField = string | LocalizedString;

/* ============================================================================
 * Images
 * ========================================================================== */

export interface ImageObject {
  url: string;
  public_id: string;
  sourceUrl?: string;
}

export type ProductImageServer = string | ImageObject;
export type ProductImageInput = File | string | ExistingImage;

export interface ExistingImage {
  url: string;
  public_id: string;
}

/* ============================================================================
 * Product
 * ========================================================================== */

export interface Product {
  _id: string;

  // с бэка здесь обычно приходит уже строка (локализованный текст),
  // а name_i18n содержит полный объект со всеми языками
  name: LocalizedField;
  name_i18n?: LocalizedString;

  description: LocalizedField;
  description_i18n?: LocalizedString;

  price: number;

  category: string | Category;
  subcategory?: string | Subcategory;

  stock: number;
  averageRating?: number;

  images: ProductImageServer[];

  createdAt?: string;
  updatedAt?: string;

  brand?: string;
  isFeatured?: boolean;
  discount?: number;
  isActive?: boolean;

  reviewsCount?: number;
  tags?: string[];

  barcode?: string;

  erplyId?: string;
  erplySKU?: string;
  erpSource?: "erply" | "manual";
  erplySyncedAt?: string;
  erplyHash?: string;
}

/* ============================================================================
 * Payloads
 * ========================================================================== */

// Для create/update мы теперь всегда шлём простые строки на текущем языке UI.
// Бэк сам определяет язык через x-client-lang и делает переводы.
export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  stock: number;
  images?: ProductImageInput[];
  brand?: string;
  discount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  barcode?: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  subcategory?: string | null;
  stock?: number;
  images?: ProductImageInput[];
  removeAllImages?: boolean;
  existingImages?: ExistingImage[] | string;
  brand?: string;
  discount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  barcode?: string;
}

/* ============================================================================
 * API responses (raw)
 * ========================================================================== */

export interface ProductsListResponse {
  message: string;
  data: {
    products: Product[];
    totalPages: number;
    totalProducts: number;
  };
}

export interface ProductByIdResponse {
  message: string;
  data: Product;
}

/**
 * Импорт из Erply через отдельные эндпоинты:
 *  - POST /products/import/erply/:erplyId
 *  - POST /products/import-by-barcode/:barcode
 *
 * Сообщение теперь может быть локализованным, поэтому не фиксируем литералы.
 */
export interface ImportFromErplyResponse {
  message: string;
  data: Product;
}

export interface DeleteImageResponse {
  message: "Image deleted" | string;
  data: { _id: string; public_id: string };
}

export interface DeleteProductResponse {
  message: "Product deleted" | string;
  data: { _id: string };
}

/* ============================================================================
 * High-level frontend result для ensureByBarcode()
 * ========================================================================== */

/**
 * Обёртка над бекенд-эндпоинтом GET /products/ensure-by-barcode/:barcode
 * после обработки в ProductService.ensureByBarcode().
 *
 * ok:
 *   true  -> был создан новый продукт на основе Erply (201)
 *   false -> либо уже существует, либо не найден, либо ошибка Erply/сети
 */
export interface EnsureByBarcodeResult {
  ok: boolean;
  status: number;
  message: string;
  data?: Product;
  /** 409 — товар с таким штрихкодом уже есть в локальной базе */
  alreadyExists?: boolean;
  /** 404 — в Erply не найден товар по этому штрихкоду */
  notFound?: boolean;
  /** 500/502/504/0 — проблемы на стороне Erply или сети */
  erplyError?: boolean;
}

/* ============================================================================
 * Helpers
 * ========================================================================== */

export const getCurrentLang = (): Lang => {
  try {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("i18nextLng");
      if (fromStorage) {
        return (fromStorage.slice(0, 2).toLowerCase() as Lang) || "en";
      }

      const htmlLang = document.documentElement.lang;
      if (htmlLang) {
        return (htmlLang.slice(0, 2).toLowerCase() as Lang) || "en";
      }

      const navLang =
        (navigator as any).language || ((navigator as any).languages || [])[0];
      if (navLang) {
        return (String(navLang).slice(0, 2).toLowerCase() as Lang) || "en";
      }
    }
  } catch {
    /* no-op */
  }
  return "en";
};

// Простой helper, чтобы дергать уже локализованный текст
export const asText = (value: LocalizedField, lang: Lang = getCurrentLang()): string => {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.en || value?.ru || value?.fi || "";
};

// Удобно использовать при запросах к API, чтобы бэк знал текущий язык
export const getLangHeader = (): Record<string, string> => {
  return { "x-client-lang": getCurrentLang() };
};
