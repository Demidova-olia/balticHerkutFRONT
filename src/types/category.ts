// src/types/category.ts
import { Subcategory } from "./subcategory";

export type LocalizedField = {
  ru?: string;
  en?: string;
  fi?: string;
  _source?: "ru" | "en" | "fi";
  _mt?: Record<string, any>;
};

export interface Category {
  _id: string;
  name: string | LocalizedField;
  name_i18n?: LocalizedField;

  description?: string | LocalizedField;
  description_i18n?: LocalizedField;

  image?: string;
  slug?: string;
  createdAt?: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}
