import axiosInstance from "../utils/axios";

interface OrderStatusUpdate {
  status: string;
}

const AdminService = {
  getStats: async () => {
    const response = await axiosInstance.get("/admin/stats");
    return response.data;
  },

  getAllOrders: async () => {
    const response = await axiosInstance.get("/admin/orders");
    return response.data;
  },


  updateOrderStatus: async (orderId: string, data: OrderStatusUpdate) => {
    const response = await axiosInstance.put(`/admin/orders/${orderId}`, data);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data;
  },
};

export default AdminService;
