import { Product } from "./product";

export interface OrderItem {
    productId: string | Product;
    quantity: number;
    price: number;
  }
  
  export interface IOrder {
    _id: string;
    user: string; // or IUser if populated
    items: OrderItem[];
    status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    totalAmount: number;
    address: string;
    createdAt: string;
    updatedAt: string;
  }
  