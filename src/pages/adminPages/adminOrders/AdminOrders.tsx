import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import './AdminOrders.css';

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

type User = {
  username: string;
  email: string;
};

type Order = {
  _id: string;
  user?: User;
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
        onChange={(e) =>
          handleStatusChange(order._id, e.target.value as Order['status'])
        }
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
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<Order[]>('/admin/orders');
      setOrders(response.data);
      setError(null);
    } catch {
      setError('Failed to fetch orders from the server');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await axiosInstance.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success('Order status updated successfully');
    } catch {
      toast.error('Failed to update order status');
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return <div className="admin-error">You do not have permission to view this page.</div>;
  }

  if (error) return <div className="error">{error} <button onClick={fetchOrders}>Retry</button></div>;
  if (loading) return <div className="loading">Loading...</div>;
  if (orders.length === 0) return <div className="no-orders">No orders available</div>;

  return (
    <div className="admin-orders">
      <h1>Order Management</h1>
      <table className="orders-table">
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

