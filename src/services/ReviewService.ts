import { Review } from "../types/review";
import axiosInstance from "../utils/axios";

const ReviewService = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const res = await axiosInstance.get(`/product/${productId}/reviews`);
    return res.data;
  },

  getOneReview: async (reviewId: string): Promise<Review> => {
    const res = await axiosInstance.get(`/product/reviews/${reviewId}`);
    return res.data;
  },

  createReview: async (productId: string, data: { rating: number; comment?: string }): Promise<Review> => {
    const res = await axiosInstance.post(`/product/${productId}/reviews`, data);
    return res.data;
  },

  updateReview: async (
    reviewId: string,
    data: { rating?: number; comment?: string }
  ): Promise<{ message: string; review: Review }> => {
    const res = await axiosInstance.put(`/product/reviews/${reviewId}`, data);
    return res.data;
  },

  deleteReview: async (reviewId: string): Promise<{ message: string; review: Review }> => {
    const res = await axiosInstance.delete(`/product/reviews/${reviewId}`);
    return res.data;
  },
};

export default ReviewService;
