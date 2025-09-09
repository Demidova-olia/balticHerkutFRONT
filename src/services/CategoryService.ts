import axios, { AxiosError } from "axios";
import axiosInstance from "../utils/axios";
import { Category } from "../types/category";
import { Subcategory } from "../types/subcategory";

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

const pickData = <T>(payload: any): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
};

const isCanceled = (err: unknown) =>
  (err as any)?.code === "ERR_CANCELED" ||
  (err as any)?.name === "CanceledError" ||
  (err as Error)?.message === "canceled";

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await axiosInstance.get("/categories", {
      dedupe: false,  
      requestKey: "categories:v1",
    });
    const list = pickData<Category[]>(res?.data);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    if (isCanceled(error)) return []; 
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};


export const createCategory = async (
  categoryData: Omit<Category, "_id" | "createdAt">
): Promise<Category> => {
  try {
    const res = await axiosInstance.post("/categories", categoryData);
    return pickData<Category>(res?.data);
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
};


export const updateCategory = async (
  id: string,
  categoryData: Partial<Omit<Category, "_id" | "createdAt">>
): Promise<Category> => {
  try {
    const res = await axiosInstance.put(`/categories/${id}`, categoryData);
    return pickData<Category>(res?.data);
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/categories/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
};

export const getCategoriesWithSubcategories = async (): Promise<
  CategoryWithSubcategories[]
> => {
  try {
    const res = await axiosInstance.get("/categories/with-subcategories", {
      dedupe: false,                    
      requestKey: "categories:subs:v1", 
    });
    const list = pickData<CategoryWithSubcategories[]>(res?.data);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    if (isCanceled(error)) return []; 
    console.error("Error fetching categories with subcategories:", error);
    throw new Error("Failed to fetch categories with subcategories");
  }
};

export const CategoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithSubcategories,
};

export default CategoryService;
