// src/pages/cart/CartPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import NavBar from "../../components/NavBar/NavBar";
import FavoriteList from "../../components/Favorite/FavoriteList";
import { useCart } from "../../hooks/useCart";
import styles from "./CartPage.module.css";

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const dec = (id: string, currentQty: number) => {

    const next = Math.max(1, currentQty - 1);
    if (next !== currentQty) updateQuantity(id, next);
  };

  const inc = (id: string, currentQty: number, stock?: number) => {
    const hasStock = Number.isFinite(Number(stock));
    if (hasStock) {
      const hardLimit = Number(stock);
      if (hardLimit <= 0) return;
      if (currentQty >= hardLimit) {
        toast.info(
          t("cart.maxReached", { defaultValue: "Max stock reached" }),
          { autoClose: 1500 }
        );
        return;
      }
      updateQuantity(id, Math.min(currentQty + 1, hardLimit));
      return;
    }
    updateQuantity(id, currentQty + 1);
  };

  return (
    <>
      <NavBar />
      <div className={styles.cartPage}>
        <h2 className={styles.cartTitle}>
          {t("cart.title", "Your Cart")}
        </h2>

        {items.length === 0 ? (
          <p className={styles.emptyMessage}>
            {t("cart.empty", "Your cart is empty")}
          </p>
        ) : (
          <div className={styles.cartItems}>
            {items.map((item) => {

              const rawStock = (item as any)?.stock;
              const hasStock = Number.isFinite(Number(rawStock));
              const stock: number | undefined = hasStock ? Number(rawStock) : undefined;
              const isOutOfStock = hasStock && stock === 0;

              const hitMax = hasStock ? item.quantity >= (stock as number) : false;

              return (
                <div key={item.id} className={styles.cartItem}>
                  <img
                    src={item.image || "/images/no-image.png"}
                    alt={item.name || t("product.noName", "No Name")}
                    className={styles.itemImage}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                    }}
                  />

                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>
                      {item.name || t("product.noName", "No Name")}
                    </h4>

                    <p className={styles.itemPrice}>
                      {(item.price ?? 0).toFixed(2)} €
                    </p>

                    <div className={styles.itemQuantity}>
                      <span className={styles.qtyLabel}>
                        {t("cart.quantity", "Quantity")}:
                      </span>

                      <div className={styles.qtyControls}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => dec(item.id, item.quantity)}
                          disabled={isOutOfStock || item.quantity <= 1}
                          aria-label={t("cart.decrease", "Decrease quantity")}
                          title={t("cart.decrease", "Decrease quantity")}
                        >
                          –
                        </button>

                        <span className={styles.qtyValue} aria-live="polite">
                          {isOutOfStock ? 0 : item.quantity}
                        </span>

                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => inc(item.id, item.quantity, stock)}
                          disabled={isOutOfStock || hitMax}
                          aria-label={t("cart.increase", "Increase quantity")}
                          title={
                            isOutOfStock
                              ? t("product.outOfStock", "Out of stock")
                              : hitMax
                              ? t("cart.maxReached", "Max stock reached")
                              : t("cart.increase", "Increase quantity")
                          }
                        >
                          +
                        </button>
                      </div>

                      {isOutOfStock && (
                        <div className={styles.outOfStockNote} aria-live="polite">
                          {t("product.outOfStock", "Out of stock")}
                        </div>
                      )}
                      {!isOutOfStock && hasStock && (
                        <div className={styles.stockHint}>
                          {t("cart.inStock", "In stock")}: {stock}
                        </div>
                      )}
                    </div>

                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.id)}
                      aria-label={t("cart.remove", "Remove")}
                    >
                      {t("cart.remove", "Remove")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.cartTotal}>
          <h3>
            {t("cart.total", "Total")}: {(getTotal() ?? 0).toFixed(2)} €
          </h3>
        </div>

        <button
          className={styles.checkoutButton}
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
          {t("cart.checkout", "Proceed to Checkout")}
        </button>

        <FavoriteList />
      </div>
    </>
  );
};

export default CartPage;
