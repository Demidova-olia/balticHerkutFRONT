import { Category } from "./category";
import { Subcategory } from "./subcategory";

export interface ImageObject {
  url: string;
  public_id: string;
}

export type ProductImage = File | string | ImageObject;

export interface Product {
  _id: string;
  name: string;
  description: string;
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

export interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  stock: number;
  images: File[]; // 🔥 Только File[], исключаем строки/объекты при отправке
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