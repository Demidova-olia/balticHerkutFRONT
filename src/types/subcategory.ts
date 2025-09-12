// src/types/subcategory.ts
import { Category, LocalizedField } from "./category";

export interface Subcategory {
  _id: string;

  name: string | LocalizedField;
  name_i18n?: LocalizedField;

  description?: string | LocalizedField;
  description_i18n?: LocalizedField;

  parent: string | Category;
  slug?: string;
}

export interface SubcategoryPayload {
  name?: string | LocalizedField;
  description?: string | LocalizedField;
  parent?: string; 
}
