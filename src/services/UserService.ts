// src/services/UserService.ts
import axiosInstance from "../utils/axios";
import { User } from "../types/user";
import { IOrder } from "../types/order";
import { Product } from "../types/product";
import { Review } from "../types/review";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Нормализация ответа API: { data: ... } или просто ...
const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data) as T;

const UserService = {
  // Все методы принимают опциональный AbortSignal для отмены
  async register(data: RegisterData, signal?: AbortSignal) {
    const res = await axiosInstance.post("/users/register", data, { signal });
    return unwrap<any>(res);
  },

  async login(data: LoginData, signal?: AbortSignal) {
    const res = await axiosInstance.post("/users/login", data, { signal });
    // обычно тут { token, user }
    return unwrap<{ token: string; user: User }>(res);
  },

  async getProfile(signal?: AbortSignal): Promise<User> {
    const res = await axiosInstance.get("/users/profile", { signal });
    return unwrap<User>(res);
  },

  async updateProfile(data: Partial<User>, signal?: AbortSignal) {
    const res = await axiosInstance.put("/users/profile", data, { signal });
    return unwrap<User>(res);
  },

  async getOrders(signal?: AbortSignal): Promise<IOrder[]> {
    // оставляю /users/orders, раз у тебя это уже используется
    const res = await axiosInstance.get("/users/orders", { signal });
    return unwrap<IOrder[]>(res) ?? [];
  },

  async getFavorites(signal?: AbortSignal): Promise<Product[]> {
    const res = await axiosInstance.get("/users/favorites", { signal });
    return unwrap<Product[]>(res) ?? [];
  },

  async getReviews(signal?: AbortSignal): Promise<Review[]> {
    const res = await axiosInstance.get("/users/reviews", { signal });
    return unwrap<Review[]>(res) ?? [];
  },

  async deleteUser(id: string, signal?: AbortSignal) {
    const res = await axiosInstance.delete(`/users/${id}`, { signal });
    return unwrap<any>(res);
  },
};

export default UserService;


