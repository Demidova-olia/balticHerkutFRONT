import { IUser } from "./user";

export interface FavoriteProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

export interface Favorite {
  _id: string;
  product: FavoriteProduct | string;
  user: IUser | string;
  createdAt?: string;
  updatedAt?: string;
}
export interface IProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}