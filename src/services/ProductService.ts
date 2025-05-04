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
  images: File[];
}

interface ProductsResponse {
  products: Product[];
  totalPages: number;
  totalProducts: number;
}

interface ErrorResponse {
  message: string;
}

export const getProducts = async (page: number = 1, limit: number = 10): Promise<ProductsResponse> => {
  try {
    const response = await axiosInstance.get("/products", {
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      const errorData = err.response.data as ErrorResponse;
      console.error('Error getting products:', errorData.message);
      throw new Error(`Failed to load products. Server responded with: ${err.response.status} - ${errorData.message}`);
    } else if (err.request) {
      console.error('Error getting products:', err.request);
      throw new Error('Failed to load products. No response from server.');
    } else {
      console.error('Error getting products:', err.message);
      throw new Error(`Failed to load products. Error: ${err.message}`);
    }
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      const errorData = err.response.data as ErrorResponse;
      console.error('Error getting product:', errorData.message);
      throw new Error(`Failed to load product with id ${id}. Server responded with: ${err.response.status} - ${errorData.message}`);
    } else if (err.request) {
      console.error('Error getting product:', err.request);
      throw new Error(`Failed to load product with id ${id}. No response from server.`);
    } else {
      console.error('Error getting product:', err.message);
      throw new Error(`Failed to load product with id ${id}. Error: ${err.message}`);
    }
  }
};

export const createProduct = async (productData: ProductData, files: File[]): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    if (productData.subcategory) {
      formData.append('subcategory', productData.subcategory);
    }
    formData.append('stock', productData.stock.toString());

    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await axiosInstance.post("/products", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      const errorData = err.response.data as ErrorResponse;
      console.error('Error creating product:', errorData.message);
      throw new Error(`Failed to create product. Server responded with: ${err.response.status} - ${errorData.message}`);
    } else if (err.request) {
      console.error('Error creating product: No response from server');
      throw new Error('Failed to create product. No response from server.');
    } else {
      console.error('Error creating product:', err.message);
      throw new Error(`Failed to create product. Error: ${err.message}`);
    }
  }
};

export const updateProduct = async (id: string, productData: ProductData, files: File[]): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    if (productData.subcategory) {
      formData.append('subcategory', productData.subcategory);
    }
    formData.append('stock', productData.stock.toString());

    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      const errorData = err.response.data as ErrorResponse;
      console.error('Error updating product:', errorData.message);
      throw new Error(`Failed to update product with id ${id}. Server responded with: ${err.response.status} - ${errorData.message}`);
    } else if (err.request) {
      console.error('Error updating product: No response from server');
      throw new Error(`Failed to update product with id ${id}. No response from server.`);
    } else {
      console.error('Error updating product:', err.message);
      throw new Error(`Failed to update product with id ${id}. Error: ${err.message}`);
    }
  }
};

export const deleteProduct = async (id: string): Promise<{ message: string, data: Product }> => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      const errorData = err.response.data as ErrorResponse;
      console.error('Error deleting product:', errorData.message);
      throw new Error(`Failed to delete product with id ${id}. Server responded with: ${err.response.status} - ${errorData.message}`);
    } else if (err.request) {
      console.error('Error deleting product: No response from server');
      throw new Error(`Failed to delete product with id ${id}. No response from server.`);
    } else {
      console.error('Error deleting product:', err.message);
      throw new Error(`Failed to delete product with id ${id}. Error: ${err.message}`);
    }
  }
};

export const getProductsByCategory = async (categoryName: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(`/products/category/${categoryName}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      const errorData = err.response.data as ErrorResponse;
      console.error('Error getting products by category:', errorData.message);
      throw new Error(`Failed to load products for category ${categoryName}. Server responded with: ${err.response.status} - ${errorData.message}`);
    } else if (err.request) {
      console.error('Error getting products by category: No response from server');
      throw new Error(`Failed to load products for category ${categoryName}. No response from server.`);
    } else {
      console.error('Error getting products by category:', err.message);
      throw new Error(`Failed to load products for category ${categoryName}. Error: ${err.message}`);
    }
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get("/products/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      const errorData = err.response.data as ErrorResponse;
      console.error('Error searching products:', errorData.message);
      throw new Error(`Failed to search products for query: ${query}. Server responded with: ${err.response.status} - ${errorData.message}`);
    } else if (err.request) {
      console.error('Error searching products: No response from server');
      throw new Error(`Failed to search products for query: ${query}. No response from server.`);
    } else {
      console.error('Error searching products:', err.message);
      throw new Error(`Failed to search products for query: ${query}. Error: ${err.message}`);
    }
  }
};
