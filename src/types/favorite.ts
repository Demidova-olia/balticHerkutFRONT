// src/types/product.ts (или допишите в существующий)
export type LocalizedField = {
  ru?: string;
  en?: string;
  fi?: string;
  _source?: "ru" | "en" | "fi";
  _mt?: Record<string, any>;
};

export type ProductImage = string | { url: string; public_id?: string };

export interface Product {
  _id: string;
  name: string | LocalizedField;
  name_i18n?: LocalizedField;

  description?: string | LocalizedField;
  description_i18n?: LocalizedField;

  price: number | string;
  images?: ProductImage[];

  category?: string;
  subcategory?: string;
}
