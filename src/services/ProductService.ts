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
): Promise<ProductsListResponse["data"]> => {
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
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data.data;
};

export const createProduct = async (data: ProductData): Promise<Product> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price.toString());
  formData.append('category', data.category);
  if (data.subcategory) formData.append('subcategory', data.subcategory);
  formData.append('stock', data.stock.toString());

  data.images.forEach((file) => {
    if (file instanceof File) {
      formData.append('images', file);
    }
  });

  const response = await axiosInstance.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

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
  formData.append('price', data.price.toString());
  formData.append('category', data.category);
  if (data.subcategory) formData.append('subcategory', data.subcategory);
  formData.append('stock', data.stock.toString());
  formData.append('removeAllImages', removeAllImages.toString());
  formData.append('existingImages', JSON.stringify(existingImages));

  data.images.forEach((file) => {
    if (file instanceof File) {
      formData.append('images', file);
    }
  });

  const response = await axiosInstance.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

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
  const response = await axiosInstance.get(`/products/${categoryId}`);
  return response.data.data;
};

export const getProductsByCategoryAndSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<Product[]> => {
  const response = await axiosInstance.get(
    `/products/${categoryId}/${subcategoryId}`
  );
  return response.data.data;
};


export const deleteProductImage = async (
  productId: string,
  publicId: string
): Promise<{ message: string; data: unknown }> => {
  const response = await axiosInstance.delete(
    `/products/${productId}/images/${publicId}`
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
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const uploadImage = async (file: File): Promise<{ url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_upload_preset"); // замените, если используете Cloudinary или другое хранилище

  const response = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
};
