// src/types/product.ts
import { Category } from "./category";
import { Subcategory } from "./subcategory";

export type Lang = "en" | "ru" | "fi";

export interface LocalizedString {
  ru?: string;
  en?: string;
  fi?: string;
  _source?: Lang;
  _mt?: Record<string, boolean>;
}

export type LocalizedField = string | LocalizedString;

export interface ImageObject {
  url: string;
  public_id: string;
}

export type ProductImageServer = string | ImageObject;
export type ProductImageInput = File | string | ExistingImage;

export interface ExistingImage {
  url: string;
  public_id: string;
}

export interface Product {
  _id: string;

  name: LocalizedField;
  name_i18n?: LocalizedString;

  description: LocalizedField;
  description_i18n?: LocalizedString;

  price: number;

  category: string | Category;
  subcategory: string | Subcategory;

  stock: number;
  averageRating?: number;

  images: ProductImageServer[];

  createdAt?: string;
  updatedAt?: string;

  brand?: string;
  isFeatured?: boolean;
  discount?: number;
  reviewsCount?: number;
  tags?: string[];
  isActive?: boolean;

  /** NEW: штрих-код товара */
  barcode?: string;
}

export interface ProductData {
  name: string | Partial<LocalizedString>;
  description: string | Partial<LocalizedString>;
  price: number;
  category: string;
  subcategory?: string;
  stock: number;
  images: ProductImageInput[];

  /** NEW: штрих-код при создании/обновлении */
  barcode?: string;
}

export interface ProductResponse {
  products: Product[];
  totalPages: number;
  totalProducts: number;
}

export interface ProductsListResponse {
  message: string;
  data: {
    products: Product[];
    totalPages: number;
    totalProducts: number;
  };
}

export const getCurrentLang = (): Lang => {
  try {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("i18nextLng");
      if (fromStorage) return (fromStorage.slice(0, 2).toLowerCase() as Lang) || "en";
      const htmlLang = document.documentElement.lang;
      if (htmlLang) return (htmlLang.slice(0, 2).toLowerCase() as Lang) || "en";
      const navLang = (navigator as any).language || ((navigator as any).languages || [])[0];
      if (navLang) return (String(navLang).slice(0, 2).toLowerCase() as Lang) || "en";
    }
  } catch {}
  return "en";
};

export const asText = (value: LocalizedField, lang: Lang = getCurrentLang()): string => {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.en || value?.ru || value?.fi || "";
};
