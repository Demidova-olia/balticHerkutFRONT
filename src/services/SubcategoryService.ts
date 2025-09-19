// src/services/SubcategoryService.ts
import type { Subcategory, SubcategoryPayload } from "../types/subcategory";
import axiosInstance from "../utils/axios";

// — helpers --------------------------------------------------------------

function unwrapArray(res: any): Subcategory[] {
  const raw = res?.data;
  const data = raw?.data ?? raw?.subcategories ?? raw;
  return Array.isArray(data) ? (data as Subcategory[]) : [];
}

function unwrapItem(res: any): Subcategory {
  const raw = res?.data;
  return (raw?.data ?? raw) as Subcategory;
}

export async function getSubcategories(
  categoryId?: string,
  opts?: { signal?: AbortSignal }
): Promise<Subcategory[]> {
  try {
    const res = await axiosInstance.get("/subcategories", {
      params: categoryId ? { category: categoryId } : undefined,
      signal: opts?.signal as any,
    });
    return unwrapArray(res);
  } catch (err: any) {
    if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
      return [];
    }
    console.error("🚀 ~ getSubcategories ~ error:", err);
    throw new Error("Failed to fetch subcategories");
  }
}

export async function createSubcategory(
  subcategory: SubcategoryPayload
): Promise<Subcategory> {
  try {
    const res = await axiosInstance.post("/subcategories", subcategory);
    return unwrapItem(res);
  } catch (err) {
    console.error("🚀 ~ createSubcategory ~ error:", err);
    throw new Error("Failed to create subcategory");
  }
}

export async function updateSubcategory(
  id: string,
  subcategory: SubcategoryPayload
): Promise<Subcategory> {
  try {
    const res = await axiosInstance.put(`/subcategories/${id}`, subcategory);
    return unwrapItem(res);
  } catch (err) {
    console.error("🚀 ~ updateSubcategory ~ error:", err);
    throw new Error("Failed to update subcategory");
  }
}

export async function deleteSubcategory(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/subcategories/${id}`);
  } catch (err) {
    console.error("🚀 ~ deleteSubcategory ~ error:", err);
    throw new Error("Failed to delete subcategory");
  }
}
