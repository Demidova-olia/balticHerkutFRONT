// src/pages/cart/CartPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
            {items.map((item) => (
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
                    <label htmlFor={`quantity-${item.id}`}>
                      {t("cart.quantity", "Quantity")}:
                    </label>
                    <select
                      id={`quantity-${item.id}`}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
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
            ))}
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


