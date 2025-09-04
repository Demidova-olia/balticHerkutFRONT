import { Review } from "../types/review";
import axiosInstance from "../utils/axios";

const ReviewService = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const res = await axiosInstance.get(`/reviews/${productId}/reviews`);
    return res.data;
  },

  getOneReview: async (reviewId: string): Promise<Review> => {
    const res = await axiosInstance.get(`/reviews/reviews/${reviewId}`);
    return res.data;
  },

  createReview: async (productId: string, data: { rating: number; comment?: string }): Promise<Review> => {
    const res = await axiosInstance.post(`/reviews/${productId}/reviews`, data);
    return res.data;
  },

  updateReview: async (
    reviewId: string,
    data: { rating?: number; comment?: string }
  ): Promise<{ message: string; review: Review }> => {
    const res = await axiosInstance.put(`/reviews/reviews/${reviewId}`, data);
    return res.data;
  },

  deleteReview: async (reviewId: string): Promise<{ message: string; review: Review }> => {
    const res = await axiosInstance.delete(`/reviews/reviews/${reviewId}`);
    return res.data;
  },
};

export default ReviewService;
