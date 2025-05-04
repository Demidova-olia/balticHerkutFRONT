import { Subcategory, SubcategoryPayload } from "../types/subcategory";
import axiosInstance from "../utils/axios";

export async function getSubcategories(): Promise<Subcategory[]> {
  try {
    const response = await axiosInstance.get("/subcategories");
    return response.data;
  } catch (error) {
    console.error("🚀 ~ getSubcategories ~ error:", error);
    throw new Error("Failed to fetch subcategories");
  }
}

export async function createSubcategory(subcategory: SubcategoryPayload): Promise<Subcategory> {
  try {
    const response = await axiosInstance.post("/subcategories", subcategory);
    return response.data;
  } catch (error) {
    console.error("🚀 ~ createSubcategory ~ error:", error);
    throw new Error("Failed to create subcategory");
  }
}

export async function updateSubcategory(id: string, subcategory: SubcategoryPayload): Promise<Subcategory> {
  try {
    const response = await axiosInstance.put(`/subcategories/${id}`, subcategory);
    return response.data;
  } catch (error) {
    console.error("🚀 ~ updateSubcategory ~ error:", error);
    throw new Error("Failed to update subcategory");
  }
}

export async function deleteSubcategory(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/subcategories/${id}`);
  } catch (error) {
    console.error("🚀 ~ deleteSubcategory ~ error:", error);
    throw new Error("Failed to delete subcategory");
  }
}


