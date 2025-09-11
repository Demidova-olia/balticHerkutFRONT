import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axios";
import { useCart } from "../../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./CheckoutPage.module.css";
import NavBar from "../../components/NavBar/NavBar";

const CheckoutPage: React.FC = () => {
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");

  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");

  useEffect(() => {
    document.title = `${t("checkout.title", "Order Summary")} — Baltic Herkut`;
  }, [t, i18n.language]);

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }),
    [i18n.language]
  );

  const orderSubmitHandler = async () => {
    if (!address.trim()) {
      toast.error(
        t(
          "checkout.toast.addressRequired",
          "Please enter your address before submitting the order."
        )
      );
      return;
    }
    if (items.length === 0) {
      toast.warn(t("checkout.toast.cartEmpty", "Your cart is empty."));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        address,
      };

      await axiosInstance.post("/orders", orderData);

      clearCart();
      toast.success(t("checkout.toast.success", "Order submitted successfully!"));
      navigate("/order-success");
    } catch {
      const msg = t(
        "checkout.toast.fail",
        "Failed to submit the order. Please try again."
      );
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className={styles.checkoutContainer}>
        <h1 className={styles.heading}>{t("checkout.title", "Order Summary")}</h1>

        <div className={styles.tableWrap}>
          <table className={styles.itemsTable} aria-label={t("checkout.tableAria", "Order items")}>
            <thead>
              <tr>
                <th className={styles.colItem}>{t("checkout.item", "Item")}</th>
                <th className={styles.colQty}>{t("checkout.quantity", "Quantity")}</th>
                <th className={styles.colPrice}>{t("checkout.unitPrice", "Unit price")}</th>
                <th className={styles.colTotal}>{t("checkout.lineTotal", "Total")}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    {t("checkout.empty", "Your cart is empty")}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const lineTotal = (item.price ?? 0) * (item.quantity ?? 0);
                  return (
                    <tr key={item.id}>
                      <td className={styles.cellItem}>
                        <div className={styles.itemCellInner}>
                          <img
                            src={item.image || "/images/no-image.png"}
                            alt={item.name || t("product.noName", "No Name")}
                            className={styles.itemThumb}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                            }}
                          />
                          <span className={styles.itemName}>
                            {item.name || t("product.noName", "No Name")}
                          </span>
                        </div>
                      </td>
                      <td className={styles.cellQty}>{item.quantity}</td>
                      <td className={styles.cellPrice}>
                        {formatCurrency.format(item.price ?? 0)}
                      </td>
                      <td className={styles.cellTotal}>
                        {formatCurrency.format(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <h2 className={styles.total}>
          {t("checkout.total", "Total")}: {formatCurrency.format(getTotal() ?? 0)}
        </h2>

        <div className={styles.addressInput}>
          <label htmlFor="address">
            {t("checkout.addressLabel", "Shipping Address")}:
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t(
              "checkout.addressPlaceholder",
              "Enter your delivery address"
            )}
            required
          />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button
          className={styles.submitButton}
          onClick={orderSubmitHandler}
          disabled={loading}
          aria-busy={loading}
        >
          {loading
            ? t("checkout.processing", "Processing...")
            : t("checkout.confirm", "Confirm Order")}
        </button>
      </div>
    </>
  );
};

export default CheckoutPage;
