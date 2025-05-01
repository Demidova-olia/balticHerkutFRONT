import { Category } from "./category";
import { Subcategory } from "./subcategory";

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string | Category;
    subcategory: string | Subcategory;
    stock: number;
    averageRating: number;
    images: string[];
    createdAt: string;
    updatedAt: string;
  }
  