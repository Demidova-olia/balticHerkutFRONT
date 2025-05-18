import { Product, ProductData, ProductsListResponse } from '../types/product';
import axiosInstance from '../utils/axios';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
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
  searchTerm = '',
  selectedCategoryId = '',
  selectedSubcategoryId = '',
  page = 1,
  limit = 10
): Promise<ProductsListResponse['data']> => {
  try {
    const response = await axiosInstance.get<ApiResponse<ProductsListResponse['data']>>('/products', {
      params: {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategoryId && { category: selectedCategoryId }),
        ...(selectedSubcategoryId && { subcategory: selectedSubcategoryId }),
        page,
        limit,
      },
    });
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, 'Failed to fetch products');
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Product>>(`/products/id/${id}`);
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
    if (productData.subcategory) {
      formData.append('subcategory', productData.subcategory);
    }
    formData.append('stock', productData.stock.toString());

    const newImages = productData.images?.filter((img): img is File => img instanceof File);
    newImages?.forEach((file) => formData.append('images', file));

    const response = await axiosInstance.post<ApiResponse<Product>>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  } catch (error) {
    handleAxiosError(error, 'Failed to create product');
  }
};

export const updateProduct = async (id: string, productData: ProductData): Promise<Product> => {
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

    const existingImages = productData.images?.filter(
      (img): img is { url: string; public_id: string } =>
        typeof img === 'object' &&
        !(img instanceof File) &&
        'url' in img &&
        'public_id' in img
    );

    if (existingImages?.length) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    const newImages = productData.images?.filter((img): img is File => img instanceof File);
    newImages?.forEach((file) => formData.append('images', file));

    const response = await axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to update product with id ${id}`);
  }
};

export const deleteProduct = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to delete product with id ${id}`);
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(`/products/category/${categoryId}`);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to load products for category ${categoryId}`);
  }
};

export const getProductsByCategoryAndSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      `/products/category/${categoryId}/subcategory/${subcategoryId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(
      error,
      `Failed to load products for category ${categoryId} and subcategory ${subcategoryId}`
    );
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(`/products/search`, {
      params: { q: query },
    });
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to search products for query: ${query}`);
  }
};

export const deleteProductImage = async (
  productId: string,
  publicId: string
): Promise<{ success: boolean }> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<{ success: boolean }>>(
      `/products/${productId}/image/${publicId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to delete image`);
  }
};

export const updateProductImage = async (
  productId: string,
  publicId: string,
  imageFile: File
): Promise<{ url: string; public_id: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axiosInstance.put<ApiResponse<{ url: string; public_id: string }>>(
      `/products/${productId}/image/${publicId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data.data;
  } catch (error) {
    handleAxiosError(error, `Failed to update image`);
  }
};
