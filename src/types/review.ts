import { IUser } from "./user";

export interface Review {
    _id: string;
    userId: IUser | string; // 
    productId: string; // or IProduct if populated
    rating: number;
    comment?: string;
    createdAt: string;
  }
  