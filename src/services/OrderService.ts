import axios from "axios"; // ✅ Добавлено для isAxiosError
import axiosInstance from "../utils/axios";
import { IOrder, OrderItem } from "../types/order";

// Create order service
export const createOrder = async (items: OrderItem[], address: string): Promise<IOrder> => {
  try {
    const response = await axiosInstance.post("/orders", { items, address });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return getFallbackOrder();
  }
};

// Get all orders service (admin access)
export const getOrders = async (): Promise<IOrder[]> => {
  try {
    const response = await axiosInstance.get("/orders");
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return [];
  }
};

// Get order by ID service
export const getOrderById = async (orderId: string): Promise<IOrder> => {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return getFallbackOrder();
  }
};

// Get orders by user ID service
export const getUserOrders = async (userId: string): Promise<IOrder[]> => {
  try {
    const response = await axiosInstance.get(`/orders/user/${userId}`);
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return [];
  }
};

// Update order service (admin access)
export const updateOrder = async (orderId: string, status: string): Promise<IOrder> => {
  try {
    const response = await axiosInstance.put(`/orders/${orderId}`, { status });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return getFallbackOrder();
  }
};

// Delete order service (admin access)
export const deleteOrder = async (orderId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return { message: "An error occurred while deleting the order." };
  }
};

// Checkout service (user access)
export const checkout = async (cart: OrderItem[], address: string, totalAmount: number): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post("/orders/checkout", { cart, address, totalAmount });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return { message: "An error occurred during checkout." };
  }
};

// Helper: handle axios errors
const handleAxiosError = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    throw error.response?.data || new Error("An unexpected Axios error occurred.");
  } else {
    throw new Error("An unexpected error occurred.");
  }
};

// Helper: fallback IOrder object
const getFallbackOrder = (): IOrder => ({
  _id: "",
  user: "",
  items: [],
  status: "PENDING",
  totalAmount: 0,
  address: "",
  createdAt: "",
  updatedAt: "",
});
