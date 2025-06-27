import axios, { AxiosError } from 'axios';
import axiosInstance from '../utils/axios';
import {
  ProductsListResponse,
  Product,
  ProductData,
} from '../types/product';

export const getProducts = async (
  searchTerm: string,
  categoryId: string,
  subcategoryId: string,
  page: number,
  limit: number
): Promise<ProductsListResponse['data']> => {
  const response = await axiosInstance.get<ProductsListResponse>('/products', {
    params: {
      search: searchTerm || undefined,
      category: categoryId || undefined,
      subcategory: subcategoryId || undefined,
      page,
      limit,
    },
  });

  return response.data.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    console.log('[getProductById] Запрос продукта по ID:', id);

    const response = await axiosInstance.get<{ data: Product }>(`/products/id/${id}`);

    console.log('[getProductById] Ответ от сервера:', response);
    console.log('[getProductById] Данные продукта:', response.data);

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError;
      console.error('[getProductById] Axios ошибка:', err.response?.data || err.message);
    } else {
      console.error('[getProductById] Неизвестная ошибка:', error);
    }
    throw error;
  }
};
export const createProduct = async (data: ProductData): Promise<Product> => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', String(data.price));
  formData.append('category', data.category);
  if (data.subcategory) formData.append('subcategory', data.subcategory);
  formData.append('stock', String(data.stock));

  data.images.forEach((file) => {
    if (file instanceof File) {
      formData.append('images', file);
    }
  });

  const response = await axiosInstance.post('/products', formData);

  return response.data.data;
};
export const updateProduct = async (
  id: string,
  data: ProductData,
  existingImages: { url: string; public_id: string }[] = [],
  removeAllImages = false
): Promise<Product> => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', String(data.price));
  formData.append('stock', String(data.stock));
  formData.append('category', data.category);
  formData.append('subcategory', data.subcategory || '');
  formData.append('removeAllImages', removeAllImages.toString());
  formData.append('existingImages', JSON.stringify(existingImages));

  data.images.forEach((file) => {
    if (file instanceof File) {
      formData.append('images', file);
    }
  });

  const response = await axiosInstance.put(`/products/${id}`, formData);
  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<Product> => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data.data;
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await axiosInstance.get('/products/search', {
    params: { q: query },
  });
  return response.data.data;
};

export const getProductsByCategory = async (
  categoryId: string
): Promise<Product[]> => {
  const response = await axiosInstance.get(`/products/category/${categoryId}`);
  return response.data.data;
};

export const getProductsByCategoryAndSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<Product[]> => {
  const response = await axiosInstance.get(
    `/products/category/${categoryId}/subcategory/${subcategoryId}`
  );
  return response.data.data;
};

export const deleteProductImage = async (
  productId: string,
  publicId: string
): Promise<{ message: string; data: unknown }> => {
  const encodedId = encodeURIComponent(publicId);
  const response = await axiosInstance.delete(
    `/products/${productId}/images/${encodedId}`
  );
  return response.data;
};

export const updateProductImage = async (
  productId: string,
  publicId: string,
  image: File
): Promise<{ message: string; data: unknown }> => {
  const formData = new FormData();
  formData.append('image', image);

  const response = await axiosInstance.put(
    `/products/${productId}/images/${publicId}`,
    formData
  );

  return response.data;
};

// Optional utility if needed for direct Cloudinary uploads (not used in backend-controlled flow)
export const uploadImage = async (
  file: File
): Promise<{ url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_upload_preset'); // Replace with real preset
  const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
};
