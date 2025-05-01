export interface Review {
    _id: string;
    userId: string; // or IUser if populated
    productId: string; // or IProduct if populated
    rating: number;
    comment?: string;
    createdAt: string;
  }
  