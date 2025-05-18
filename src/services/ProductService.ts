import axiosInstance from '../utils/axios';
import { Product, ProductData } from '../types/product';

export const getProducts = async (
  search = '',
  category = '',
  subcategory = '',
  page = 1,
  limit = 10
): Promise<{ products: Product[]; totalPages: number; totalProducts: number }> => {
  try {
    const response = await axiosInstance.get('/products', {
      params: { search, category, subcategory, page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to get products', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.get(`/products/id/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to get product by id: ${id}`, error);
    throw error;
  }
};

export const createProduct = async (data: ProductData): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('category', data.category);
    if (data.subcategory) formData.append('subcategory', data.subcategory);
    formData.append('stock', data.stock.toString());

    data.images.forEach(item => {
      if (item instanceof File) {
        formData.append('images', item);
      }
    });

    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to create product', error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  data: ProductData,
  existingImages: { url: string; public_id: string }[] = [],
  removeAllImages = false
): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('category', data.category);
    if (data.subcategory) formData.append('subcategory', data.subcategory);
    formData.append('stock', data.stock.toString());
    formData.append('removeAllImages', removeAllImages.toString());
    formData.append('existingImages', JSON.stringify(existingImages));

    data.images.forEach(item => {
      if (item instanceof File) {
        formData.append('images', item);
      }
    });

    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update product with id: ${id}`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to delete product with id: ${id}`, error);
    throw error;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get('/products/search', {
      params: { q: query },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to search products for query: ${query}`, error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(`/products/${categoryId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to get products by category: ${categoryId}`, error);
    throw error;
  }
};

export const getProductsByCategoryAndSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(`/products/${categoryId}/${subcategoryId}`);
    return response.data.data;
  } catch (error) {
    console.error(
      `Failed to get products by category: ${categoryId} and subcategory: ${subcategoryId}`,
      error
    );
    throw error;
  }
};

export const deleteProductImage = async (
  productId: string,
  publicId: string
): Promise<{ message: string; data: unknown }> => {
  try {
    const response = await axiosInstance.delete(`/products/${productId}/images/${publicId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete image with publicId: ${publicId} from productId: ${productId}`, error);
    throw error;
  }
};

export const updateProductImage = async (
  productId: string,
  publicId: string,
  image: File
): Promise<{ message: string; data: unknown }> => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    const response = await axiosInstance.put(`/products/${productId}/images/${publicId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to update image with publicId: ${publicId} on productId: ${productId}`, error);
    throw error;
  }
};
