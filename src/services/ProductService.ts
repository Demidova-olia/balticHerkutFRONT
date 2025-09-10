import axios from "axios";
import axiosInstance from "../utils/axios";
import {
  ProductsListResponse,
  Product,
  ProductData,
} from "../types/product";


const appendLocalized = (
  fd: FormData,
  key: string,
  value: string | Record<string, unknown>
) => {
  if (typeof value === "string") {
    fd.append(key, value);
  } else if (value && typeof value === "object") {
    fd.append(key, JSON.stringify(value));
  } else {
    fd.append(key, ""); 
  }
};

const isCanceled = (err: unknown) =>
  (err as any)?.code === "ERR_CANCELED" ||
  (err as any)?.name === "CanceledError" ||
  (err as Error)?.message === "canceled";

export const getProducts = async (
  searchTerm: string,
  categoryId: string,
  subcategoryId: string,
  page: number,
  limit: number
): Promise<ProductsListResponse["data"]> => {
  try {
    const response = await axiosInstance.get<ProductsListResponse>("/products", {
      params: {
        search: searchTerm || undefined,
        category: categoryId || undefined,
        subcategory: subcategoryId || undefined,
        page,
        limit,
      },
      dedupe: false,
      requestKey: `products:${page}:${limit}:${searchTerm}:${categoryId}:${subcategoryId}`,
    });

    return response.data.data;
  } catch (error) {
    if (isCanceled(error)) {
      return { products: [], totalPages: 0, totalProducts: 0 };
    }
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    console.log("[getProductById] Get product by ID:", id);

    const response = await axiosInstance.get<{ data: Product }>(
      `/products/id/${id}`,
      {
        dedupe: false,     
        requestKey: `product-${id}-${Date.now()}` 
      }
    );

    console.log("[getProductById] Server response:", response);
    console.log("[getProductById] Product data:", response.data);

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[getProductById] Axios error:",
        error.response?.data || error.message
      );
    } else {
      console.error("[getProductById] Unknown error:", error);
    }
    throw error;
  }
};

export const createProduct = async (data: ProductData): Promise<Product> => {
  const formData = new FormData();

  appendLocalized(formData, "name", data.name);
  appendLocalized(formData, "description", data.description);

  formData.append("price", String(data.price));
  formData.append("category", data.category);

  if (data.subcategory && data.subcategory !== "undefined" && data.subcategory !== "null") {
    formData.append("subcategory", data.subcategory);
  }

  formData.append("stock", String(data.stock));

  data.images.forEach((file) => {
    if (file instanceof File) {
      formData.append("images", file);
    }
  });


  const response = await axiosInstance.post("/products", formData);
  return response.data.data;
};

export const updateProduct = async (
  id: string,
  data: ProductData,
  existingImages: { url: string; public_id: string }[] = [],
  removeAllImages = false
): Promise<Product> => {
  const formData = new FormData();

  appendLocalized(formData, "name", data.name);
  appendLocalized(formData, "description", data.description);

  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));
  formData.append("category", data.category);

  if (data.subcategory && data.subcategory !== "undefined" && data.subcategory !== "null") {
    formData.append("subcategory", data.subcategory);
  }

  formData.append("removeAllImages", String(!!removeAllImages));
  formData.append("existingImages", JSON.stringify(existingImages || []));

  data.images.forEach((file) => {
    if (file instanceof File) {
      formData.append("images", file);
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
  const response = await axiosInstance.get("/products/search", {
    params: { q: query },
    dedupe: false,
    requestKey: `search:${query}`,
  });
  return response.data.data;
};

export const getProductsByCategory = async (
  categoryId: string
): Promise<Product[]> => {
  const response = await axiosInstance.get(`/products/${categoryId}`, {
    dedupe: false,
    requestKey: `byCategory:${categoryId}`,
  });
  return response.data.data;
};

export const getProductsByCategoryAndSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<Product[]> => {
  const response = await axiosInstance.get(
    `/products/${categoryId}/${subcategoryId}`,
    { dedupe: false, requestKey: `byCatSub:${categoryId}:${subcategoryId}` }
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
  formData.append("image", image);

  const encodedId = encodeURIComponent(publicId);
  const response = await axiosInstance.put(
    `/products/${productId}/images/${encodedId}`,
    formData
  );

  return response.data;
};

// Optional utility if needed for direct Cloudinary uploads (not used in backend-controlled flow)
export const uploadImage = async (
  file: File
): Promise<{ url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_upload_preset"); // Replace with real preset

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
};
