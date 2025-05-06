export interface FavoriteProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

export interface Favorite {
  _id: string;
  product: FavoriteProduct | string;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}
