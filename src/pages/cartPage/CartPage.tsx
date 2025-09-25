// src/pages/cart/CartPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import NavBar from "../../components/NavBar/NavBar";
import FavoriteList from "../../components/Favorite/FavoriteList";
import { useCart } from "../../hooks/useCart";
import styles from "./CartPage.module.css";
import { sendOrderEmail } from "../../services/OrderService";

type CustomerForm = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
};

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  // ======= checkout modal =======
  const [showCheckout, setShowCheckout] = useState(false);
  const [sending, setSending] = useState(false);
  const [customer, setCustomer] = useState<CustomerForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  // безопасно пересчитываем сумму, реагируя на изменения items
  const total = useMemo(() => Number(getTotal() ?? 0), [items, getTotal]);

  const dec = (id: string, currentQty: number) => {
    const next = Math.max(1, currentQty - 1);
    if (next !== currentQty) updateQuantity(id, next);
  };

  const getHardLimit = (item: any): number | undefined => {
    const candidates = [item?.stock, item?.max, item?.available, item?.limit];
    for (const v of candidates) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return undefined;
  };

  const inc = (id: string, currentQty: number, itemRef: any) => {
    const hardLimit = getHardLimit(itemRef);
    if (Number.isFinite(Number(hardLimit))) {
      const limit = Number(hardLimit);
      const remaining = Math.max(0, limit - currentQty);
      if (remaining <= 0) {
        toast.info(t("cart.maxReached", { defaultValue: "Max stock reached" }), { autoClose: 1500 });
        return;
      }
      updateQuantity(id, currentQty + 1);
      return;
    }
    // лимит неизвестен — ведём себя консервативно
    toast.info(t("cart.maxReached", { defaultValue: "Max stock reached" }), { autoClose: 1200 });
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setShowCheckout(true);
  };

  const validateCustomer = (c: CustomerForm) => {
    if (!c.name.trim()) return "Введите имя";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) return "Неверный email";
    return null;
  };

  const submitOrder = async () => {
    const err = validateCustomer(customer);
    if (err) {
      toast.error(err);
      return;
    }
    setSending(true);
    try {
      const orderPayload = {
        // адрес получателя берётся на бэке из ORDER_TO
        subject: `Новый заказ с сайта — ${customer.name}`,
        order: {
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: Number(i.price ?? 0),
            quantity: Number(i.quantity ?? 0),
            stock: Number.isFinite(Number((i as any).stock)) ? Number((i as any).stock) : undefined,
          })),
          total,
          currency: "EUR",
          createdAt: new Date().toISOString(),
        },
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone?.trim() || undefined,
          address: customer.address?.trim() || undefined,
          notes: customer.notes?.trim() || undefined,
        },
      };

      await sendOrderEmail(orderPayload);

      toast.success(t("cart.orderSent", { defaultValue: "Order has been sent!" }));
      setShowCheckout(false);
      navigate("/checkout");
    } catch (e: any) {
      const msg =
        e?.message ||
        t("cart.orderSendFailed", { defaultValue: "Failed to send the order." });
      toast.error(String(msg));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className={styles.cartPage}>
        <h2 className={styles.cartTitle}>{t("cart.title", "Your Cart")}</h2>

        {items.length === 0 ? (
          <p className={styles.emptyMessage}>{t("cart.empty", "Your cart is empty")}</p>
        ) : (
          <div className={styles.cartItems}>
            {items.map((item) => {
              const hardLimit = getHardLimit(item);
              const hasStock = Number.isFinite(Number(hardLimit));
              const stock = hasStock ? Number(hardLimit) : undefined;
              const isOutOfStock = hasStock && stock === 0;
              const remaining = hasStock ? Math.max(0, (stock as number) - item.quantity) : 0;
              const disablePlus = isOutOfStock || remaining <= 0;

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
                    <h4 className={styles.itemName}>{item.name || t("product.noName", "No Name")}</h4>

                    <p className={styles.itemPrice}>{(item.price ?? 0).toFixed(2)} €</p>

                    <div className={styles.itemQuantity}>
                      <span className={styles.qtyLabel}>{t("cart.quantity", "Quantity")}:</span>

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
                          onClick={() => inc(item.id, item.quantity, item)}
                          disabled={disablePlus}
                          aria-label={t("cart.increase", "Increase quantity")}
                          title={
                            isOutOfStock
                              ? t("product.outOfStock", "Out of stock")
                              : disablePlus
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
            {t("cart.total", "Total")}: {total.toFixed(2)} €
          </h3>
        </div>

        <button
          className={styles.checkoutButton}
          onClick={handleCheckoutClick}
          disabled={items.length === 0}
        >
          {t("cart.checkout", "Proceed to Checkout")}
        </button>

        <FavoriteList />
      </div>

      {showCheckout && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Order form">
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{t("checkout.title", { defaultValue: "Order details" })}</h3>

            <div className={styles.formGrid}>
              <label className={styles.label}>
                {t("checkout.name", { defaultValue: "Name" })}*
                <input
                  className={styles.input}
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </label>

              <label className={styles.label}>
                Email*
                <input
                  className={styles.input}
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </label>

              <label className={styles.label}>
                {t("checkout.phone", { defaultValue: "Phone" })}
                <input
                  className={styles.input}
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="+358 ..."
                />
              </label>

              <label className={styles.label} style={{ gridColumn: "1 / -1" }}>
                {t("checkout.address", { defaultValue: "Address" })}
                <input
                  className={styles.input}
                  type="text"
                  value={customer.address}
                  onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                  placeholder={t("checkout.addressPlaceholder", { defaultValue: "Street, city" })}
                />
              </label>

              <label className={styles.label} style={{ gridColumn: "1 / -1" }}>
                {t("checkout.notes", { defaultValue: "Notes" })}
                <textarea
                  className={styles.textarea}
                  value={customer.notes}
                  onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))}
                  placeholder={t("checkout.notesPlaceholder", { defaultValue: "Delivery time, comments…" })}
                  rows={3}
                />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowCheckout(false)}
                disabled={sending}
              >
                {t("common.cancel", { defaultValue: "Cancel" })}
              </button>
              <button
                className={styles.submitBtn}
                onClick={submitOrder}
                disabled={sending}
                aria-busy={sending}
              >
                {sending
                  ? t("checkout.sending", { defaultValue: "Sending…" })
                  : t("checkout.submit", { defaultValue: "Send order" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPage;
