import { Category } from "./category";
import { Subcategory } from "./subcategory";

interface ImageObject {
  url: string;
  public_id: string;
}

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
  images: (File | { url: string; public_id: string })[];
}
  export interface ProductsResponse {
    products: Product[];
    total: number;
  }
export interface ProductsListResponse {
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
}