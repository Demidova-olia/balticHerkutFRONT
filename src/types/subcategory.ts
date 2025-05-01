import { Category } from "./category";

export interface Subcategory {
    _id: string;
    name: string;
    parent: string | Category;
  }
  