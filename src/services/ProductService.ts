// src/services/ProductService.ts
import axios from "axios";
import axiosInstance from "../utils/axios";
const withApiPrefix = (u: string) => {
  const base = String(axiosInstance.defaults.baseURL || "");

  if (/\/api\/?$/.test(base)) return u;

  return `/api${u.startsWith("/") ? "" : "/"}${u.replace(/^\//, "")}`;
};
import {
  ProductsListResponse,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductByIdResponse,
} from "../types/product";

const appendLocalized = (
  fd: FormData,
  key: string,
  value?: string | Record<string, unknown>
) => {
  if (value === undefined || value === null) return;
  if (typeof value === "string") fd.append(key, value);
  else fd.append(key, JSON.stringify(value));
};

const appendIfDefined = (fd: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null || value === "") return;
  fd.append(key, String(value));
};

const appendBoolean = (fd: FormData, key: string, value?: boolean) => {
  if (typeof value === "boolean") fd.append(key, String(value));
};

const isCanceled = (err: unknown) =>
  (err as any)?.code === "ERR_CANCELED" ||
  (err as any)?.name === "CanceledError" ||
  (err as Error)?.message === "canceled";

/* ================== READ ================== */

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
    const response = await axiosInstance.get<ProductByIdResponse>(`/products/id/${id}`, {
      dedupe: false,
      requestKey: `product-${id}-${Date.now()}`,
    });
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("[getProductById] Axios error:", error.response?.data || error.message);
    } else {
      console.error("[getProductById] Unknown error:", error);
    }
    throw error;
  }
};

/* ================== CREATE ================== */

export const createProduct = async (data: CreateProductPayload): Promise<Product> => {
  const formData = new FormData();

  appendLocalized(formData, "name", data.name);
  appendLocalized(formData, "description", data.description);
  formData.append("price", String(data.price));
  formData.append("category", data.category);
  formData.append("stock", String(data.stock));

  if (data.subcategory && data.subcategory !== "undefined" && data.subcategory !== "null") {
    formData.append("subcategory", data.subcategory);
  }
  appendIfDefined(formData, "brand", data.brand);
  appendIfDefined(formData, "discount", data.discount);
  appendBoolean(formData, "isFeatured", data.isFeatured);
  appendBoolean(formData, "isActive", data.isActive);

  formData.append("barcode", (data as any).barcode ?? "");

  (data.images || []).forEach((item) => {
    if (item instanceof File) formData.append("images", item);
    else if (typeof item === "string") formData.append("images", item);
    else if (item && typeof item === "object" && "url" in item)
      formData.append("images", JSON.stringify(item));
  });

  const response = await axiosInstance.post("/products", formData);
  return response.data.data;
};

/* ================== UPDATE ================== */

export const updateProduct = async (
  id: string,
  data: UpdateProductPayload,
  existingImages: { url: string; public_id: string }[] = [],
  removeAllImages = false
): Promise<Product> => {
  const formData = new FormData();

  appendLocalized(formData, "name", data.name);
  appendLocalized(formData, "description", data.description);
  if (typeof data.price === "number") formData.append("price", String(data.price));
  if (typeof data.stock === "number") formData.append("stock", String(data.stock));
  appendIfDefined(formData, "category", data.category);

  if (typeof data.subcategory === "string" && data.subcategory) {
    formData.append("subcategory", data.subcategory);
  }

  appendIfDefined(formData, "brand", data.brand);
  appendIfDefined(formData, "discount", data.discount);
  appendBoolean(formData, "isFeatured", data.isFeatured);
  appendBoolean(formData, "isActive", data.isActive);

  if ("barcode" in data) {
    formData.append("barcode", (data as any).barcode ?? "");
  }

  formData.append("removeAllImages", String(!!removeAllImages));
  if (existingImages?.length) {
    formData.append("existingImages", JSON.stringify(existingImages));
  }

  (data.images || []).forEach((item) => {
    if (item instanceof File) formData.append("images", item);
    else if (typeof item === "string") formData.append("images", item);
    else if (item && typeof item === "object" && "url" in item)
      formData.append("images", JSON.stringify(item));
  });

  const response = await axiosInstance.put(`/products/${id}`, formData);
  return response.data.data;
};

/* ================== DELETE / SEARCH / FILTERS ================== */

export const deleteProduct = async (id: string): Promise<{ _id: string }> => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data.data as { _id: string };
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await axiosInstance.get("/products/search", {
    params: { q: query },
    dedupe: false,
    requestKey: `search:${query}`,
  });
  return response.data.data;
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
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
  const response = await axiosInstance.get(`/products/${categoryId}/${subcategoryId}`, {
    dedupe: false,
    requestKey: `byCatSub:${categoryId}:${subcategoryId}`,
  });
  return response.data.data;
};

/* ================== IMAGE OPS ================== */

export const deleteProductImage = async (
  productId: string,
  publicId: string
): Promise<{ message: string; data: { _id: string; public_id: string } }> => {
  const encodedId = encodeURIComponent(publicId);
  const response = await axiosInstance.delete(`/products/${productId}/images/${encodedId}`);
  return response.data;
};

export const updateProductImage = async (
  productId: string,
  publicId: string,
  image: File
): Promise<{ message: string; data: { _id: string; public_id: string; url: string } }> => {
  const formData = new FormData();
  formData.append("image", image);
  const encodedId = encodeURIComponent(publicId);
  const response = await axiosInstance.put(`/products/${productId}/images/${encodedId}`, formData);
  return response.data;
};

/* ================== ERPLY endpoints ================== */

export const ensureByBarcode = async (barcode: string): Promise<Product> => {
  const response = await axiosInstance.get(`/products/ensure-by-barcode/${barcode}`, {
    dedupe: false,
    requestKey: `ensure:${barcode}`,
  });
  return response.data.data;
};

export const importFromErplyById = async (erplyId: string): Promise<Product> => {
  const url = withApiPrefix(`/products/import/erply/${erplyId}`);
  const response = await axiosInstance.post(url);
  return response.data.data;
};

export const importFromErplyByBarcode = async (barcode: string): Promise<Product> => {
  const url = withApiPrefix(`/products/import-by-barcode/${barcode}`);
  const response = await axiosInstance.post(url);
  return response.data.data;
};
export const syncPriceStock = async (
  productId: string
): Promise<{ message: string; data: unknown }> => {
  const response = await axiosInstance.put(`/products/${productId}/sync-erply-light`);
  return response.data;
};

/* ================== Cloudinary direct (optional) ================== */

export const uploadImage = async (
  file: File
): Promise<{ url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "baltic_uploads");

  const response = await fetch("https://api.cloudinary.com/v1_1/diw6ugcy3/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Image upload failed");

  const data = await response.json();
  return { url: data.secure_url, public_id: data.public_id };
};
