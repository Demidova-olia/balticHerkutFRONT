// src/hooks/useCart.ts
import { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import type { CartContextType } from "../types/cartContextTypes";

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined || context === null) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

