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
    brand?: string;
    isFeatured?: boolean;
    discount?: number;
    reviewsCount?: number;
    tags?: string[];
    isActive?: boolean;
  }
  export interface ProductData {
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    stock: number;
    images: File[];
  }
  