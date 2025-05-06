import { Product } from "../types/product";
import { User } from "../types/user";
import axiosInstance from "../utils/axios";

export interface Favorite {
  _id: string;
  user: string | User;
  product: string | Product;
  createdAt?: string;
  updatedAt?: string;
}

const FavoriteService = {
  getFavorites: async (): Promise<Favorite[]> => {
    try {
      const response = await axiosInstance.get("/favorites");
      return response.data;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },
  
  addToFavorites: async (productId: string) => {
    try {
      return await axiosInstance.post(`/favorites/${productId}`);
    } catch (error) {
      console.error("Error adding product to favorites:", error);
      throw error; 
    }
  },

  removeFromFavorites: async (productId: string) => {
    try {
      return await axiosInstance.delete(`/favorites/${productId}`);
    } catch (error) {
      console.error("Error removing product from favorites:", error);
      throw error;
    }
  },
};

export default FavoriteService;

