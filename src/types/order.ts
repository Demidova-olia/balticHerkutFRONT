import { Product } from "./product";
import { IUser } from "./user";

export interface OrderItem {
    productId: string | Product;
    quantity: number;
    price: number;
  }
  
  export interface IOrder {
    _id: string;
    user: string | IUser;
    items: OrderItem[];
    status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    totalAmount: number;
    address: string;
    createdAt: string;
    updatedAt: string;
  }
  