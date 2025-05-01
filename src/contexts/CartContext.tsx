import { createContext, useReducer, useEffect, ReactNode } from "react";
import { toast } from "react-toastify";
import {
  CartItem,
  CartState,
  CartAction,
  CartContextType
} from "../types/cartContextTypes";

const CartContext = createContext<CartContextType | undefined>(undefined);

export { CartContext };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY":
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
};

export function CartProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    if (userId) {
      const savedCart = localStorage.getItem(`cart_${userId}`);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          parsedCart.forEach((item: CartItem) => {
            dispatch({ type: "ADD_ITEM", payload: item });
          });
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      }
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      if (state.items.length > 0) {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(state.items));
      } else {
        localStorage.removeItem(`cart_${userId}`);
      }
    }
  }, [state.items, userId]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    toast.success("Item added to cart", { autoClose: 2000 });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast.success("Item removed from cart", { autoClose: 2000 });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    localStorage.removeItem(`cart_${userId}`);
  };

  const getTotal = () => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
