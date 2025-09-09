import { Category } from "./category";
import { Subcategory } from "./subcategory";

/** Языковой код, который мы поддерживаем */
export type Lang = "en" | "ru" | "fi";

/** Поле, как хранится на бэкенде (локализованный объект) */
export interface LocalizedString {
  ru?: string;
  en?: string;
  fi?: string;
  _source?: Lang;                 // откуда исходная строка
  _mt?: Record<string, boolean>;  // пометки машинного перевода
}

/** Поле может прийти либо строкой (если бэк уже отдал нужный язык),
 *  либо объектом со всеми языками */
export type LocalizedField = string | LocalizedString;

export interface ImageObject {
  url: string;
  public_id: string;
}

export type ProductImage = File | string | ImageObject;

export interface Product {
  _id: string;

  // ⬇️ локализованные поля
  name: LocalizedField;
  description: LocalizedField;

  price: number;

  category: string | Category;
  subcategory: string | Subcategory;

  stock: number;
  averageRating: number;

  images: ImageObject[];
  createdAt: string;
  updatedAt: string;

  brand?: string;
  isFeatured?: boolean;
  discount?: number;
  reviewsCount?: number;
  tags?: string[];
  isActive?: boolean;
}

/** При создании/обновлении можно отправлять либо одну строку
 *  (бэк сам переведёт/разложит), либо объект частично/полностью. */
export interface ProductData {
  name: string | Partial<LocalizedString>;
  description: string | Partial<LocalizedString>;
  price: number;
  category: string;
  subcategory?: string;
  stock: number;
  images: (File | ExistingImage)[];
}

export interface ExistingImage {
  url: string;
  public_id: string;
}

export interface ProductResponse {
  products: Product[];
  totalPages: number;
  totalProducts: number;
}

export interface ProductsListResponse {
  data: {
    products: Product[];
    totalPages: number;
    totalProducts: number;
  };
  message: string;
}

/* =======================
 * Удобные хелперы (опц.)
 * ======================= */

/** Определяем текущий язык из i18next/localStorage/html/navigator */
export const getCurrentLang = (): Lang => {
  try {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("i18nextLng");
      if (fromStorage) return (fromStorage.slice(0, 2).toLowerCase() as Lang) || "en";
      const htmlLang = document.documentElement.lang;
      if (htmlLang) return (htmlLang.slice(0, 2).toLowerCase() as Lang) || "en";
      const navLang =
        (navigator as any).language || ((navigator as any).languages || [])[0];
      if (navLang) return (String(navLang).slice(0, 2).toLowerCase() as Lang) || "en";
    }
  } catch {}
  return "en";
};

/** Безопасно достаём текст из LocalizedField */
export const asText = (value: LocalizedField, lang: Lang = getCurrentLang()): string => {
  if (typeof value === "string") return value;
  return (
    value?.[lang] ||
    value?.en ||
    value?.ru ||
    value?.fi ||
    ""
  );
};
