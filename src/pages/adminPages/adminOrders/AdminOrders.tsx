import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import axiosInstance from "../../../utils/axios";
import { toast } from "react-toastify";
import styles from "./AdminOrders.module.css";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import BottomNav from "../../../components/Admin/BottomNav";

type Product = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

type OrderItem = {
  productId: Product;
  quantity: number;
};

type UserInfo = {
  username: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
};

type Order = {
  _id: string;
  user?: UserInfo;
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
      <ul>
        {order.items.map((item, index) => (
          <li key={index}>
            {item.productId?.name || "Unknown product"} x {item.quantity}
          </li>
        ))}
      </ul>
    </td>
    <td>€{order.totalAmount.toFixed(2)}</td>
    <td>{order.address}</td>
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
        {error} <button onClick={fetchOrders}>Retry</button>
      </div>
    );
  if (fetching) return <div className={styles.loading}>Loading...</div>;
  if (orders.length === 0) return <div className={styles.noOrders}>No orders available</div>;

  return (
    <div className={styles.adminOrders}>
      <h1>Order Management</h1>
      <AdminNavBar />

      <table className={styles.ordersTable}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User Email</th>
            <th>Products</th>
            <th>Total</th>
            <th>Address</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} handleStatusChange={handleStatusChange} />
          ))}
        </tbody>
      </table>

      <BottomNav />
    </div>
  );
};

export default AdminOrders;
