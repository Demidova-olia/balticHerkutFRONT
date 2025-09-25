// src/services/orders.ts
import axios from "axios";
import axiosInstance from "../utils/axios";
import { IOrder, OrderItem } from "../types/order";

export type OrderEmailItem = {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
};

export type OrderEmailPayload = {
  subject?: string;
  order: {
    items: OrderEmailItem[];
    total: number;
    currency?: string;
    createdAt?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
  };
};

export const sendOrderEmail = async (payload: OrderEmailPayload): Promise<any> => {
  try {
    const nowIso = new Date().toISOString();

    const normalized: OrderEmailPayload = {
      subject: payload.subject || "Новый заказ с сайта",
      order: {
        items: payload.order.items || [],
        total: Number(payload.order.total || 0),
        currency: payload.order.currency || "EUR",
        createdAt: payload.order.createdAt || nowIso,
      },
      customer: {
        name: payload.customer.name?.trim(),
        email: payload.customer.email?.trim(),
        phone: payload.customer.phone?.trim() || undefined,
        address: payload.customer.address?.trim() || undefined,
        notes: payload.customer.notes?.trim() || undefined,
      },
    };

    const key = (import.meta as any)?.env?.VITE_ORDER_EMAIL_KEY;
    const headers: Record<string, string> = {};
    if (key) headers["x-order-email-key"] = String(key);

    const res = await axiosInstance.post("/orders/email", normalized, {
      timeout: 30000,
      headers, 
    });

    return res.data;
  } catch (error: unknown) {
    handleAxiosError(error);
  }
};


export const createOrder = async (items: OrderItem[], address: string): Promise<IOrder> => {
  try {
    const response = await axiosInstance.post("/orders", { items, address });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return getFallbackOrder();
  }
};

export const getOrders = async (): Promise<IOrder[]> => {
  try {
    const response = await axiosInstance.get("/orders");
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return [];
  }
};

export const getOrderById = async (orderId: string): Promise<IOrder> => {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return getFallbackOrder();
  }
};

export const getUserOrders = async (userId: string): Promise<IOrder[]> => {
  try {
    const response = await axiosInstance.get(`/orders/user/${userId}`);
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return [];
  }
};

export const updateOrder = async (orderId: string, status: string): Promise<IOrder> => {
  try {
    const response = await axiosInstance.put(`/orders/${orderId}`, { status });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return getFallbackOrder();
  }
};

export const deleteOrder = async (orderId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return { message: "An error occurred while deleting the order." };
  }
};

export const checkout = async (
  cart: OrderItem[],
  address: string,
  totalAmount: number
): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post("/orders/checkout", {
      cart,
      address,
      totalAmount,
    });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error);
    return { message: "An error occurred during checkout." };
  }
};

const handleAxiosError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;
    const message =
      data?.reason ||
      data?.message ||
      error.message ||
      "An unexpected Axios error occurred.";
    throw new Error(message);
  }
  throw new Error("An unexpected error occurred.");
};

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
