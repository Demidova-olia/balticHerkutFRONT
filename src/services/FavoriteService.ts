import axiosInstance from "../utils/axios";

interface FavoriteProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

class FavoriteService {
  static async getFavorites(): Promise<FavoriteProduct[]> {
    const response = await axiosInstance.get("/favorites");
    return response.data;
  }

  static async addToFavorites(productId: string): Promise<void> {
    await axiosInstance.post("/favorites", { productId });
  }

  static async removeFromFavorites(productId: string): Promise<void> {
    await axiosInstance.delete(`/favorites/${productId}`);
  }
}

export default FavoriteService;
