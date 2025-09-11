import React, { useEffect, useState } from "react";
import axios from "axios";
import UserService from "../../services/UserService";
import { IOrder } from "../../types/order";
import { IUser } from "../../types/user";
import { useTranslation } from "react-i18next";
import Loading from "../../components/Loading/Loading";

const MyOrderList: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(n) ? n : 0);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        setLoading(true);
        // Если у вас уже есть поддержка AbortSignal в UserService, можно передать сигнал.
        const data = await UserService.getOrders();
        if (!alive) return;
        setOrders(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (!alive) return;
        // Игнорируем отменённые запросы (на всякий случай)
        if (axios.isAxiosError(err) && err.code === "ERR_CANCELED") {
          return;
        }
        setError(
          t("orders.unknownError", {
            defaultValue: "An unknown error occurred.",
          })
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [t]);

  const toggleOrderDetails = (orderId: string) => {
    setOpenOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // --- helpers ---
  const isPopulatedProduct = (p: any): p is { name?: string; price?: number } =>
    p && typeof p === "object";

  const getProductName = (productId: unknown): string => {
    if (typeof productId === "string")
      return productId || t("orders.unknownProduct", { defaultValue: "Unknown product" });
    if (isPopulatedProduct(productId) && typeof productId.name === "string")
      return productId.name || t("orders.unknownProduct", { defaultValue: "Unknown product" });
    return t("orders.unknownProduct", { defaultValue: "Unknown product" });
  };

  const getItemPrice = (item: any): number => {
    if (item && typeof item.price === "number") return item.price;
    if (isPopulatedProduct(item?.productId) && typeof item.productId.price === "number")
      return item.productId.price;
    return 0;
  };

  const getUserName = (user: unknown): string => {
    if (typeof user === "string") return user || t("orders.unknownUser", { defaultValue: "Unknown user" });
    const u = user as IUser | undefined;
    return u?.username || t("orders.unknownUser", { defaultValue: "Unknown user" });
  };

  const getUserEmail = (user: unknown): string => {
    if (typeof user === "string") return t("orders.unknownEmail", { defaultValue: "Unknown Email" });
    const u = user as IUser | undefined;
    return u?.email || t("orders.unknownEmail", { defaultValue: "Unknown Email" });
  };

  if (loading) return <Loading textKey="loading.orders" />;

  if (error) {
    return (
      <p className="text-red-500">
        {t("orders.errorPrefix", { defaultValue: "Error:" })} {error}
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        {t("orders.title", { defaultValue: "My Orders" })}
      </h2>

      {orders.length === 0 ? (
        <p>{t("orders.empty", { defaultValue: "You have no orders." })}</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order._id} className="border rounded p-4 shadow-sm">
              <p>
                <strong>{t("orders.orderId", { defaultValue: "Order ID:" })}</strong>{" "}
                <button
                  onClick={() => toggleOrderDetails(order._id)}
                  className="text-blue-500 hover:underline"
                >
                  {order._id}
                </button>
              </p>

              {openOrderId === order._id && (
                <div className="mt-4">
                  <p>
                    <strong>{t("orders.user", { defaultValue: "User:" })}</strong>{" "}
                    {getUserName(order.user)} ({getUserEmail(order.user)})
                  </p>
                  <p>
                    <strong>{t("orders.address", { defaultValue: "Address:" })}</strong>{" "}
                    {order.address || "—"}
                  </p>
                  <p>
                    <strong>{t("orders.total", { defaultValue: "Total:" })}</strong>{" "}
                    {fmtEUR(Number(order.totalAmount || 0))}
                  </p>
                  <p>
                    <strong>{t("orders.status", { defaultValue: "Status:" })}</strong>{" "}
                    {order.status || "—"}
                  </p>
                  <p>
                    <strong>{t("orders.createdAt", { defaultValue: "Created At:" })}</strong>{" "}
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                  </p>

                  <div className="mt-2">
                    <p className="font-semibold">{t("orders.items", { defaultValue: "Items:" })}</p>
                    <ul className="list-disc list-inside">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item: any, idx: number) => {
                          const name = getProductName(item?.productId);
                          const price = getItemPrice(item);
                          const qty = Number(item?.quantity || 0);
                          return (
                            <li key={item?._id ?? `${order._id}-${idx}`}>
                              {name} ×{qty} — {fmtEUR(price)}
                            </li>
                          );
                        })
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyOrderList;

