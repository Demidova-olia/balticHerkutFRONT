import { User } from "../types/user";
import axiosInstance from "../utils/axios";

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

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token not found in localStorage.");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const UserService = {
  register: async (data: RegisterData) => {
    const response = await axiosInstance.post("/users/register", data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await axiosInstance.post("/users/login", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get("/users/profile", getAuthHeaders());
    return response.data;
  },

  getOrders: async () => {
    const response = await axiosInstance.get("/users/orders", getAuthHeaders());
    return response.data;
  },

  getFavorites: async () => {
    const response = await axiosInstance.get("/users/favorites", getAuthHeaders());
    return response.data;
  },

  getReviews: async () => {
    const response = await axiosInstance.get("/users/reviews", getAuthHeaders());
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/users/${id}`, getAuthHeaders());
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await axiosInstance.put("/users/profile", data, getAuthHeaders());
    return response.data;
  },
};

export default UserService;

