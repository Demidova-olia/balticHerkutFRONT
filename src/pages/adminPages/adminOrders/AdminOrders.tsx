// src/pages/admin/orders/AdminOrders.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import axiosInstance from "../../../utils/axios";
import { toast } from "react-toastify";
import styles from "./AdminOrders.module.css";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import BottomNav from "../../../components/Admin/BottomNav";
import { useTranslation } from "react-i18next";

type Product = {
  _id: string;
  name: unknown;      
  price?: number;
  image?: string;
};

type OrderItem = {
  productId: Product | string | null | undefined;
  quantity: number;
};

type UserInfo = {
  username?: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
};

type Order = {
  _id: string;
  user?: UserInfo | null;
  items: OrderItem[];
  status: "pending" | "shipped" | "delivered" | "canceled" | "paid" | "finished";
  totalAmount: number;
  createdAt: string;
  address: string;
};

function pickLocalized(value: unknown, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const v = value as Record<string, any>;
  const short = (lang || "en").slice(0, 2);

  if (typeof v[short] === "string" && v[short].trim()) return v[short].trim();
  if (typeof v._source === "string" && typeof v[v._source] === "string" && v[v._source].trim()) {
    return v[v._source].trim();
  }

  if (typeof v.en === "string" && v.en.trim()) return v.en.trim();
  if (typeof v.ru === "string" && v.ru.trim()) return v.ru.trim();
  if (typeof v.fi === "string" && v.fi.trim()) return v.fi.trim();
  return "";
}

const AdminOrders = () => {
  const { user, loading } = (useAuth() as { user?: any; loading?: boolean }) || {};
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation("common");

  const isAdmin = useMemo(() => {
    const role = String(user?.role ?? user?.user?.role ?? "").trim().toLowerCase();
    return Boolean(user?.isAdmin || user?.user?.isAdmin || role === "admin");
  }, [user]);

  const statusOptions = useMemo(
    () => [
      { label: t("admin.orders.statusLabels.pending",   { defaultValue: "Pending" }),   value: "pending"   as const },
      { label: t("admin.orders.statusLabels.shipped",   { defaultValue: "Shipped" }),   value: "shipped"   as const },
      { label: t("admin.orders.statusLabels.delivered", { defaultValue: "Delivered" }), value: "delivered" as const },
      { label: t("admin.orders.statusLabels.canceled",  { defaultValue: "Canceled" }),  value: "canceled"  as const },
      { label: t("admin.orders.statusLabels.paid",      { defaultValue: "Paid" }),      value: "paid"      as const },
      { label: t("admin.orders.statusLabels.finished",  { defaultValue: "Finished" }),  value: "finished"  as const },
    ],
    [t]
  );

  const fetchOrders = async () => {
    try {
      setFetching(true);
      setError(null);
      const { data } = await axiosInstance.get<Order[]>("/admin/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const s = e?.response?.status;
      setError(
        s === 401
          ? t("admin.orders.errors.unauthorized", { defaultValue: "Unauthorized (401): check your auth." })
          : s === 403
          ? t("admin.orders.errors.forbidden", { defaultValue: "Forbidden (403): no rights to view orders." })
          : t("admin.orders.errors.fetch", { defaultValue: "Failed to fetch orders from the server" })
      );
      setOrders([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && isAdmin) fetchOrders();
  }, [loading, isAdmin]);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await axiosInstance.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(t("admin.orders.toasts.updated", { defaultValue: "Order status updated" }));
    } catch (e: any) {
      const s = e?.response?.status;
      toast.error(
        s === 401
          ? t("admin.orders.errors.unauthorizedShort", { defaultValue: "Unauthorized (401)" })
          : s === 403
          ? t("admin.orders.errors.forbiddenShort", { defaultValue: "Forbidden (403): admin required" })
          : t("admin.orders.errors.updateFailed", { defaultValue: "Update failed" })
      );
    }
  };

  const lang = i18n.resolvedLanguage || i18n.language || "en";

  const OrderRow = ({ order }: { order: Order }) => (
    <tr>
      <td>{order._id}</td>
      <td>{order.user?.email || t("admin.orders.fallbacks.noData", { defaultValue: "No data" })}</td>
      <td>
        {Array.isArray(order.items) && order.items.length > 0 ? (
          <ul>
            {order.items.map((item, index) => {
              let name = "";
              const p = item?.productId as any;
              if (!p) {
                name = t("admin.orders.fallbacks.unknownProduct", { defaultValue: "Unknown product" });
              } else if (typeof p === "string") {
                name = p || t("admin.orders.fallbacks.unknownProduct", { defaultValue: "Unknown product" });
              } else {
                name =
                  pickLocalized(p?.name, lang) ||
                  t("admin.orders.fallbacks.unknownProduct", { defaultValue: "Unknown product" });
              }
              return (
                <li key={index}>
                  {name} × {item.quantity}
                </li>
              );
            })}
          </ul>
        ) : (
          <em>—</em>
        )}
      </td>
      <td>
        {t("admin.orders.table.totalShort", { defaultValue: "€" })}
        {Number(order.totalAmount || 0).toFixed(2)}
      </td>
      <td>{order.address || "—"}</td>
      <td>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(order._id, e.target.value as Order["status"])}
          className={styles.selectStatus}
          disabled={["finished", "canceled"].includes(order.status)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
    </tr>
  );

  if (loading) {
    return <div className={styles.loading}>{t("loading.default", { defaultValue: "Loading..." })}</div>;
  }

  if (!isAdmin) {
    return (
      <div className={styles.adminError}>
        {t("admin.orders.permissionDenied", { defaultValue: "You do not have permission to view this page." })}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        {error}{" "}
        <button onClick={fetchOrders}>
          {t("admin.metrics.refresh", { defaultValue: "Refresh" })}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
    <div className={styles.adminOrders}>
      <h1>{t("admin.orders.title", { defaultValue: "Order Management" })}</h1>
      <AdminNavBar />

      <table className={styles.ordersTable}>
        <thead>
          <tr>
            <th>{t("admin.orders.table.orderId", { defaultValue: "Order ID" })}</th>
            <th>{t("admin.orders.table.userEmail", { defaultValue: "User Email" })}</th>
            <th>{t("admin.orders.table.products", { defaultValue: "Products" })}</th>
            <th>{t("admin.orders.table.total", { defaultValue: "Total" })}</th>
            <th>{t("admin.orders.table.address", { defaultValue: "Address" })}</th>
            <th>{t("admin.orders.table.status", { defaultValue: "Status" })}</th>
            <th>{t("admin.orders.table.date", { defaultValue: "Date" })}</th>
          </tr>
        </thead>

        <tbody>
          {fetching ? (
            <tr>
              <td colSpan={7} className={styles.loading}>
                {t("loading.default", { defaultValue: "Loading..." })}
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles.noOrders}>
                {t("admin.orders.empty", { defaultValue: "No orders yet." })}
              </td>
            </tr>
          ) : (
            orders.map((order) => <OrderRow key={order._id} order={order} />)
          )}
        </tbody>
      </table>

      <BottomNav />
    </div>
    </div>
  );
};

export default AdminOrders;


