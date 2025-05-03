import { Product } from '../types/product';
import axiosInstance from '../utils/axios';

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

export const getProducts = async (page: number = 1, limit: number = 10): Promise<ProductsResponse> => {
  try {
    const response = await axiosInstance.get("/products", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting products:", error);
    throw new Error("Failed to load products.");
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting product:", error);
    throw new Error(`Failed to load product with id ${id}.`);
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
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product.");
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
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Failed to update product with id ${id}.`);
  }
};

export const deleteProduct = async (id: string): Promise<{ message: string, data: Product }> => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product with id ${id}.`);
  }
};

export const getProductsByCategory = async (categoryName: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(`/products/category/${categoryName}`);
    return response.data;
  } catch (error) {
    console.error("Error getting products by category:", error);
    throw new Error(`Failed to load products for category ${categoryName}.`);
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get("/products/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error(`Failed to search products for query: ${query}.`);
  }
};
