import { createContext, useReducer, useEffect, ReactNode } from "react";
import { toast } from "react-toastify";
import {
  CartItem,
  CartState,
  CartAction,
  CartContextType,
} from "../types/cartContextTypes";

const CartContext = createContext<CartContextType | undefined>(undefined);
export { CartContext };

function clampByStock(
  requestedQty: number,
  stock?: number
): { nextQty: number; capped: boolean } {
  if (!Number.isFinite(stock as number)) {
    const q = Math.max(1, requestedQty);
    return { nextQty: q, capped: false };
  }
  const limit = Math.max(0, Number(stock));
  const q = Math.max(0, Math.min(requestedQty, limit));
  return { nextQty: q, capped: requestedQty > limit };
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const payload = action.payload as CartItem & { stock?: number };
      const existing = state.items.find((i) => i.id === payload.id);

      if (existing) {
        const stock =
          (existing as any).stock ?? (payload as any).stock ?? undefined;

        const requested = existing.quantity + payload.quantity;
        const { nextQty, capped } = clampByStock(requested, stock);

        if (capped) {
          toast.info(
            stock && stock > 0 ? `Maximum available: ${stock}` : "Out of stock",
            { autoClose: 1800 }
          );
        }

        return {
          items: state.items.map((i) =>
            i.id === existing.id
              ? {
                  ...i,
                  quantity: nextQty,
                  ...(stock !== undefined ? { stock } : {}),
                }
              : i
          ),
        };
      }

      const stock = (payload as any).stock ?? undefined;
      const { nextQty, capped } = clampByStock(payload.quantity, stock);

      if (capped) {
        toast.info(
          stock && stock > 0 ? `Maximum available: ${stock}` : "Out of stock",
          { autoClose: 1800 }
        );
      }

      return {
        items: [
          ...state.items,
          {
            ...payload,
            quantity: nextQty,
            ...(stock !== undefined ? { stock } : {}),
          },
        ],
      };
    }

    case "REMOVE_ITEM":
      return {
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload as {
        id: string;
        quantity: number;
      };

      return {
        items: state.items.map((item) => {
          if (item.id !== id) return item;

          const stock = (item as any).stock ?? undefined;
          const { nextQty, capped } = clampByStock(quantity, stock);

          if (capped) {
            toast.info(
              stock && stock > 0
                ? `Maximum available: ${stock}`
                : "Out of stock",
              { autoClose: 1800 }
            );
          }

          const safeQty =
            Number.isFinite(stock as number) && Number(stock) === 0
              ? 0
              : Math.max(1, nextQty);

          return { ...item, quantity: safeQty };
        }),
      };
    }

    case "CLEAR_CART":
      return { items: [] };

    default:
      return state;
  }
};

export function CartProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    if (!userId) return;
    const savedCart = localStorage.getItem(`cart_${userId}`);
    if (savedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        parsedCart.forEach((item) => {

          dispatch({ type: "ADD_ITEM", payload: item });
        });
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (state.items.length > 0) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(state.items));
    } else {
      localStorage.removeItem(`cart_${userId}`);
    }
  }, [state.items, userId]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    toast.success("Item added to cart", { autoClose: 1500 });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast.success("Item removed from cart", { autoClose: 1500 });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    if (userId) localStorage.removeItem(`cart_${userId}`);
  };

  const getTotal = () => {
    return state.items.reduce(
      (total, item) => total + (item.price ?? 0) * (item.quantity ?? 0),
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
