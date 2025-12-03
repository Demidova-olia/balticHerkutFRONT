// src/services/ProductService.ts
import axios from "axios";
import axiosInstance from "../utils/axios";
import {
  ProductsListResponse,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductByIdResponse,
} from "../types/product";

/* ============================================================================
 * Helpers
 * ========================================================================== */

const withApiPrefix = (u: string) => {
  const base = String(axiosInstance.defaults.baseURL || "");
  if (/\/api\/?$/.test(base)) return u; // baseURL already includes /api
  return `/api${u.startsWith("/") ? "" : "/"}${u.replace(/^\//, "")}`;
};

const appendLocalized = (
  fd: FormData,
  key: string,
  value?: string | Record<string, unknown>
) => {
  if (value == null) return;
  fd.append(key, typeof value === "string" ? value : JSON.stringify(value));
};

const appendIfDefined = (fd: FormData, key: string, value: unknown) => {
  if (value == null || value === "") return;
  fd.append(key, String(value));
};

const appendBoolean = (fd: FormData, key: string, value?: boolean) => {
  if (typeof value === "boolean") fd.append(key, String(value));
};

const isCanceled = (err: unknown) =>
  (err as any)?.code === "ERR_CANCELED" ||
  (err as any)?.name === "CanceledError" ||
  (err as Error)?.message === "canceled";

/* ============================================================================
 * SAFE GETTER — меньше падений
 * ========================================================================== */
const safeGet = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  try {
    return await fn();
  } catch (err) {
    if (!isCanceled(err)) console.error("Request failed:", err);
    return null;
  }
};

/* ============================================================================
 * PRODUCTS
 * ========================================================================== */

export const getProducts = async (
  searchTerm: string,
  categoryId: string,
  subcategoryId: string,
  page: number,
  limit: number,
  includeUncategorized?: boolean
): Promise<ProductsListResponse["data"]> => {
  return (
    (await safeGet(async () => {
      const res = await axiosInstance.get<ProductsListResponse>("/products", {
        params: {
          search: searchTerm || undefined,
          category: categoryId || undefined,
          subcategory: subcategoryId || undefined,
          page,
          limit,
          includeUncategorized:
            typeof includeUncategorized === "boolean" ? includeUncategorized : undefined,
        },
        dedupe: false,
        requestKey: `products:${page}:${limit}:${searchTerm}:${categoryId}:${subcategoryId}:${includeUncategorized}`,
      });
      return res.data.data;
    })) ?? { products: [], totalPages: 0, totalProducts: 0 }
  );
};

export const getProductById = async (id: string): Promise<Product | null> => {
  return await safeGet(async () => {
    const res = await axiosInstance.get<ProductByIdResponse>(`/products/id/${id}`, {
      dedupe: false,
      requestKey: `product-${id}`,
    });
    return res.data.data;
  });
};

/* ============================================================================
 * CREATE / UPDATE
 * ========================================================================== */

export const createProduct = async (data: CreateProductPayload): Promise<Product> => {
  const fd = new FormData();

  appendLocalized(fd, "name", data.name);
  appendLocalized(fd, "description", data.description);
  fd.append("price", String(data.price));
  fd.append("category", data.category);
  fd.append("stock", String(data.stock));
  appendIfDefined(fd, "subcategory", data.subcategory);
  appendIfDefined(fd, "brand", data.brand);
  appendIfDefined(fd, "discount", data.discount);
  appendBoolean(fd, "isFeatured", data.isFeatured);
  appendBoolean(fd, "isActive", data.isActive);
  fd.append("barcode", (data as any).barcode ?? "");

  (data.images || []).forEach((item) => {
    if (item instanceof File) fd.append("images", item);
    else fd.append("images", typeof item === "string" ? item : JSON.stringify(item));
  });

  const res = await axiosInstance.post("/products", fd);
  return res.data.data;
};

export const updateProduct = async (
  id: string,
  data: UpdateProductPayload,
  existingImages: { url: string; public_id: string }[] = [],
  removeAllImages = false
): Promise<Product> => {
  const fd = new FormData();

  appendLocalized(fd, "name", data.name);
  appendLocalized(fd, "description", data.description);
  appendIfDefined(fd, "price", data.price);
  appendIfDefined(fd, "stock", data.stock);
  appendIfDefined(fd, "category", data.category);
  appendIfDefined(fd, "subcategory", data.subcategory);
  appendIfDefined(fd, "brand", data.brand);
  appendIfDefined(fd, "discount", data.discount);
  appendBoolean(fd, "isFeatured", data.isFeatured);
  appendBoolean(fd, "isActive", data.isActive);

  if ("barcode" in data) fd.append("barcode", (data as any).barcode ?? "");

  fd.append("removeAllImages", String(removeAllImages));
  if (existingImages.length) fd.append("existingImages", JSON.stringify(existingImages));

  (data.images || []).forEach((item) => {
    if (item instanceof File) fd.append("images", item);
    else fd.append("images", typeof item === "string" ? item : JSON.stringify(item));
  });

  const res = await axiosInstance.put(`/products/${id}`, fd);
  return res.data.data;
};

/* ============================================================================
 * DELETE / SEARCH
 * ========================================================================== */

export const deleteProduct = async (id: string): Promise<{ _id: string }> => {
  const res = await axiosInstance.delete(`/products/${id}`);
  return res.data.data;
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  return (
    (await safeGet(async () => {
      const res = await axiosInstance.get("/products/search", {
        params: { q: query },
        dedupe: false,
        requestKey: `search:${query}`,
      });
      return res.data.data;
    })) ?? []
  );
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  return (
    (await safeGet(async () => {
      const res = await axiosInstance.get(`/products/${categoryId}`);
      return res.data.data;
    })) ?? []
  );
};

export const getProductsByCategoryAndSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<Product[]> => {
  return (
    (await safeGet(async () => {
      const res = await axiosInstance.get(`/products/${categoryId}/${subcategoryId}`);
      return res.data.data;
    })) ?? []
  );
};

/* ============================================================================
 * IMAGE OPERATIONS
 * ========================================================================== */

export const deleteProductImage = async (
  productId: string,
  publicId: string
) => {
  const encoded = encodeURIComponent(publicId);
  const res = await axiosInstance.delete(`/products/${productId}/images/${encoded}`);
  return res.data;
};

export const updateProductImage = async (
  productId: string,
  publicId: string,
  image: File
) => {
  const fd = new FormData();
  fd.append("image", image);

  const encoded = encodeURIComponent(publicId);
  const res = await axiosInstance.put(`/products/${productId}/images/${encoded}`, fd);
  return res.data;
};

/* ============================================================================
 * ERPLY
 * ========================================================================== */

/**
 * SAFE ensureByBarcode()
 *
 * Никогда не бросает AxiosError.
 * Возвращает структурированный объект:
 *   ok: boolean
 *   status: number
 *   message: string
 *   data?: Product
 *   alreadyExists?: boolean
 *   notFound?: boolean
 *   erplyError?: boolean
 */
export const ensureByBarcode = async (
  barcode: string
): Promise<{
  ok: boolean;
  status: number;
  message: string;
  data?: Product;
  alreadyExists?: boolean;
  notFound?: boolean;
  erplyError?: boolean;
}> => {
  try {
    const res = await axiosInstance.get(
      withApiPrefix(`/products/ensure-by-barcode/${barcode}`),
      {
        validateStatus: () => true,
        requestKey: `ensure:${barcode}`,
        public: true,
        skipAuthRedirect: true,
      }
    );

    const status = res.status;
    const message = res.data?.message || "Unknown";

    if (status === 201) {
      return { ok: true, status, message, data: res.data.data };
    }
    if (status === 409) {
      return { ok: false, status, message, alreadyExists: true };
    }
    if (status === 404) {
      return { ok: false, status, message, notFound: true };
    }
    if (status === 400) {
      return { ok: false, status, message };
    }
    if ([500, 502, 504].includes(status)) {
      return { ok: false, status, message, erplyError: true };
    }

    return { ok: false, status, message };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      message: err?.message || "Network error",
      erplyError: true,
    };
  }
};

export const importFromErplyById = async (erplyId: string): Promise<Product> => {
  const url = withApiPrefix(`/products/import/erply/${erplyId}`);
  const res = await axiosInstance.post(url);
  return res.data.data;
};

export const importFromErplyByBarcode = async (barcode: string): Promise<Product> => {
  const url = withApiPrefix(`/products/import-by-barcode/${barcode}`);
  const res = await axiosInstance.post(url);
  return res.data.data;
};

export const syncPriceStock = async (productId: string) => {
  const res = await axiosInstance.put(`/products/${productId}/sync-erply-light`);
  return res.data;
};

/* ============================================================================
 * CLOUDINARY direct
 * ========================================================================== */

export const uploadImage = async (
  file: File
): Promise<{ url: string; public_id: string }> => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "baltic_uploads");

  const res = await fetch("https://api.cloudinary.com/v1_1/diw6ugcy3/image/upload", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error("Image upload failed");

  const data = await res.json();
  return { url: data.secure_url, public_id: data.public_id };
};
