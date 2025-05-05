import { Category } from "../types/category";
import { Subcategory } from "../types/subcategory";
import axiosInstance from "../utils/axios";

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axiosInstance.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

export const createCategory = async (
  categoryData: Omit<Category, "_id" | "createdAt">
): Promise<Category> => {
  try {
    const response = await axiosInstance.post("/categories", categoryData);
    return response.data;
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
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    return response.data;
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
export const getCategoriesWithSubcategories = async (): Promise<CategoryWithSubcategories[]> => {
  try {
    const response = await axiosInstance.get("/categories/with-subcategories"); // <-- убедись в правильности пути
    return response.data;
  } catch (error) {
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
