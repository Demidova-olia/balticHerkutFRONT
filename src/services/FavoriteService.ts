import { Product } from "../types/product";
import axiosInstance from "../utils/axios";

class FavoriteService {
  static async addToFavorites(productId: string): Promise<Product> {
    console.log("Adding to favorites with productId:", productId);
    try {
      const response = await axiosInstance.post("/favorites", { productId });
      return response.data;
    } catch (error: unknown) {
      console.error("Error adding to favorites:", error); 
      this.handleApiError(error);
      return Promise.reject(); 
    }
  }

  static async removeFromFavorites(productId: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/favorites/${productId}`);
      return response.data; 
    } catch (error: unknown) {
      this.handleApiError(error);
      return Promise.reject();
    }
  }

  static async getFavorites(): Promise<Product[]> {
    try {
      const response = await axiosInstance.get("/favorites");
      return response.data; 
    } catch (error: unknown) {
      this.handleApiError(error);
      return Promise.reject(); 
    }
  }

  private static handleApiError(error: unknown): never {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to communicate with the server");
    }
    throw new Error("An unknown error occurred while communicating with the server");
  }
}

export default FavoriteService;
