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
    const response = await axiosInstance.get("/users/profile");
    return response.data;
  },

  getOrders: async () => {
    const response = await axiosInstance.get("/users/orders");
    return response.data;
  },

  getFavorites: async () => {
    const response = await axiosInstance.get("/users/favorites");
    return response.data;
  },

  getReviews: async () => {
    const response = await axiosInstance.get("/users/reviews");
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

};

export default UserService;

