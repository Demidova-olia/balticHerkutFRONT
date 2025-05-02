import { Subcategory } from "../types/subcategory";
import axiosInstance from "../utils/axios"


class SubcategoryService {
  static async getSubcategories(): Promise<Subcategory[]> {
    try {
      const response = await axiosInstance.get("/subcategories");
      return response.data;
    } catch (error) {
      console.log("🚀 ~ SubcategoryService ~ getSubcategories ~ error:", error)
      throw new Error("Failed to fetch subcategories");
    }
  }

  static async createSubcategory(subcategory: Subcategory): Promise<Subcategory> {
    try {
      const response = await axiosInstance.post("/subcategories", subcategory);
      return response.data;
    } catch (error) {
      console.log("🚀 ~ SubcategoryService ~ createSubcategory ~ error:", error)
      throw new Error("Failed to create subcategory");
    }
  }

  static async updateSubcategory(id: string, subcategory: Subcategory): Promise<Subcategory> {
    try {
      const response = await axiosInstance.put(`/subcategories/${id}`, subcategory);
      return response.data;
    } catch (error) {
      console.log("🚀 ~ SubcategoryService ~ updateSubcategory ~ error:", error)
      throw new Error("Failed to update subcategory");
    }
  }

  static async deleteSubcategory(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/subcategories/${id}`);
    } catch (error) {
      console.log("🚀 ~ SubcategoryService ~ deleteSubcategory ~ error:", error)
      throw new Error("Failed to delete subcategory");
    }
  }
}

export default SubcategoryService;
