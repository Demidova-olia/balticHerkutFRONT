export interface User {
    _id: string;
    username: string;
    email: string;
    role?: "ADMIN" | "USER";
    isActive: boolean;
    profilePicture?: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    phoneNumber?: string;
    orders?: string[]; // or IOrder[]
    createdAt?: string;
    updatedAt?: string;
  }
  export interface IUser {
    _id: string;
    name: string;
  }
