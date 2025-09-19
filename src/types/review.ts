import { IUser } from "./user";

export interface Review {
    _id: string;
    userId: IUser | string; 
    productId: string; 
    rating: number;
    comment?: string;
    createdAt: string;
  }
  