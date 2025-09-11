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
  name: string;
  price: number;
  image: string;
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

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Canceled", value: "canceled" },
  { label: "Paid", value: "paid" },
  { label: "Finished", value: "finished" },
];

function productNameFrom(item: OrderItem): string {
  const p = item?.productId as any;
  if (!p) return "Unknown product";
  if (typeof p === "string") return p || "Unknown product";
  return p?.name || "Unknown product";
}

const OrderRow = ({
  order,
  handleStatusChange,
}: {
  order: Order;
  handleStatusChange: (orderId: string, newStatus: Order["status"]) => void;
}) => (
  <tr>
    <td>{order._id}</td>
    <td>{order.user?.email || "No data"}</td>
    <td>
      {Array.isArray(order.items) && order.items.length > 0 ? (
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {productNameFrom(item)} × {item.quantity}
            </li>
          ))}
        </ul>
      ) : (
        <em>—</em>
      )}
    </td>
    <td>€{Number(order.totalAmount || 0).toFixed(2)}</td>
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

const AdminOrders = () => {
  const { user, loading } = (useAuth() as { user?: any; loading?: boolean }) || {};
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation("common");

  const isAdmin = useMemo(() => {
    const role = String(user?.role ?? user?.user?.role ?? "").trim().toLowerCase();
    return Boolean(user?.isAdmin || user?.user?.isAdmin || role === "admin");
  }, [user]);

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
          ? "Unauthorized (401): проверьте авторизацию."
          : s === 403
          ? "Forbidden (403): нет прав на список заказов."
          : "Failed to fetch orders from the server"
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
      toast.success("Order status updated");
    } catch (e: any) {
      const s = e?.response?.status;
      toast.error(
        s === 401 ? "Unauthorized (401)" : s === 403 ? "Forbidden (403): need admin" : "Update failed"
      );
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!isAdmin) return <div className={styles.adminError}>You do not have permission to view this page.</div>;
  if (error)
    return (
      <div className={styles.error}>
        {error} <button onClick={fetchOrders}>{t("admin.metrics.refresh", { defaultValue: "Refresh" })}</button>
      </div>
    );

  return (
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
              <td colSpan={7} className={styles.loading}>{t("loading.default", { defaultValue: "Loading..." })}</td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles.noOrders}>
                {t("admin.orders.empty", { defaultValue: "No orders yet." })}
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <OrderRow key={order._id} order={order} handleStatusChange={handleStatusChange} />
            ))
          )}
        </tbody>
      </table>

      <BottomNav />
    </div>
  );
};

export default AdminOrders;

