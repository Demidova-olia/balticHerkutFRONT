import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import styles from './AdminOrders.module.css';
import { AdminNavBar } from '../../../components/Admin/AdminNavBar';

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
  status: 'pending' | 'shipped' | 'delivered' | 'canceled' | 'paid' | 'finished';
  totalAmount: number;
  createdAt: string;
  address: string;
};

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'Paid', value: 'paid' },
  { label: 'Finished', value: 'finished' },
];

const OrderRow = ({
  order,
  handleStatusChange,
}: {
  order: Order;
  handleStatusChange: (orderId: string, newStatus: Order['status']) => void;
}) => (
  <tr>
    <td>{order._id}</td>
    <td>{order.user?.email || 'No data'}</td>
    <td>
      <ul>
        {order.items.map((item, index) => (
          <li key={index}>
            {item.productId?.name || 'Unknown product'} x {item.quantity}
          </li>
        ))}
      </ul>
    </td>
    <td>€{order.totalAmount.toFixed(2)}</td>
    <td>{order.address}</td>
    <td>
      <select
        value={order.status}
        onChange={(e) => handleStatusChange(order._id, e.target.value as Order['status'])}
        className={styles.selectStatus}
        disabled={['finished', 'canceled'].includes(order.status)}
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
  const { user, loading } = useAuth() as { user?: any; loading?: boolean };
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Нормализация роли: учитываем разные формы user
  const { isAdmin } = useMemo(() => {
    const rawRole =
      (user?.role ??
        user?.user?.role ?? // если профиль вложен
        '').toString();
    const role = rawRole.trim().toLowerCase();
    const adminFlag = Boolean(user?.isAdmin || user?.user?.isAdmin);
    return { isAdmin: adminFlag || role === 'admin' };
  }, [user]);

  const fetchOrders = async () => {
    try {
      setFetching(true);
      setError(null);
      // важно: если cookie-сессия — axiosInstance должен иметь withCredentials=true
      const response = await axiosInstance.get<Order[]>('/admin/orders', {
        params: { _t: Date.now() }, // анти-кэш
      });
      setOrders(response.data);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        setError('Unauthorized (401): проверьте, передаются ли cookie/JWT.');
      } else if (status === 403) {
        setError('Forbidden (403): у этой учётки нет прав на список заказов.');
      } else {
        setError('Failed to fetch orders from the server');
      }
      setOrders([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    // грузим только когда:
    // 1) auth-состояние загрузилось
    // 2) юзер есть и он админ
    if (!loading && user && isAdmin) {
      fetchOrders();
    }
  }, [loading, user, isAdmin]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await axiosInstance.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order))
      );
      toast.success('Order status updated successfully');
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) toast.error('Unauthorized (401): токен/сессия не передаются');
      else if (status === 403) toast.error('Forbidden (403): нужна роль admin для изменения');
      else toast.error('Failed to update order status');
    }
  };

  // Пока грузится состояние авторизации — ничего не решаем
  if (loading) return <div className={styles.loading}>Loading...</div>;

  // Если нет юзера или не админ — показываем отказ
  if (!user || !isAdmin) {
    return <div className={styles.adminError}>You do not have permission to view this page.</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        {error} <button onClick={fetchOrders}>Retry</button>
      </div>
    );
  }

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
    </div>
  );
};

export default AdminOrders;
