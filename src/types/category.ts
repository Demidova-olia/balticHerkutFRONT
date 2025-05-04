import { Subcategory } from "./subcategory";

export interface Category {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    createdAt?: string;
  }
  export interface CategoryWithSubcategories extends Category {
    subcategories: Subcategory[];
  }