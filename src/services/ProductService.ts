import { Product } from '../types/product';
import axiosInstance from '../utils/axios';
import { AxiosError } from 'axios';

interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  stock: number;
  images?: File[];
}

interface ErrorResponse {
  message: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface ProductsListResponse {
  products: Product[];
  total: number;
}

function handleAxiosError(error: unknown, context: string): never {
  const err = error as AxiosError;
  if (err.response) {
    const errorData = err.response.data as ErrorResponse;
    console.error(`${context}:`, errorData.message);
    throw new Error(`${context}. Server responded with: ${err.response.status} - ${errorData.message}`);
  } else if (err.request) {
    console.error(`${context}: No response from server`);
    throw new Error(`${context}. No response from server.`);
  } else {
    console.error(`${context}:`, err.message);
    throw new Error(`${context}. Error: ${err.message}`);
  }
}

export const getProducts = async (
  searchTerm = "",
  selectedCategoryId = "",
  selectedSubcategoryId = "",
  page = 1,
  limit = 10
): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<ProductsListResponse>("/products", {
      params: {
        search: searchTerm,
        category: selectedCategoryId,
        subcategory: selectedSubcategoryId,
        page,
        limit,
      },
    });

    return response.data.products;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch products");
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to load product with id ${id}`);
  }
};

export const createProduct = async (productData: ProductData): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    if (productData.subcategory) formData.append('subcategory', productData.subcategory);
    formData.append('stock', productData.stock.toString());
    productData.images?.forEach(file => formData.append('images', file));

    const response = await axiosInstance.post<ApiResponse<Product>>("/products", formData);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Failed to create product");
  }
};

export const updateProduct = async (id: string, productData: ProductData): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    if (productData.subcategory) formData.append('subcategory', productData.subcategory);
    formData.append('stock', productData.stock.toString());
    productData.images?.forEach(file => formData.append('images', file));

    const response = await axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to update product with id ${id}`);
  }
};

export const deleteProduct = async (id: string): Promise<{ message: string; data: Product }> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, `Failed to delete product with id ${id}`);
  }
};

export const getProductsByCategory = async (categoryName: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(`/products/category/${categoryName}`);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to load products for category ${categoryName}`);
  }
};

export const getProductsByCategoryAndSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<ProductsListResponse>(`/products`, {
      params: { category: categoryId, subcategory: subcategoryId },
    });
    return response.data.products;
  } catch (error) {
    handleAxiosError(error, `Failed to load products for category ${categoryId} and subcategory ${subcategoryId}`);
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Product[]>>("/products/search", {
      params: { q: query },
    });
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to search products for query: ${query}`);
  }
};
