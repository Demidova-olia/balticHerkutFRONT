import React, { useEffect, useState } from "react";
import axios from "axios";
import { IOrder } from "../../types/order";
import UserService from "../../services/UserService";
import { getDecodedToken, isAuthenticated } from "../../utils/authUtils";

const MyOrderList: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error("You must be logged in to view your orders.");
        }

        const decoded = getDecodedToken();
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token);

        if (!decoded || !decoded.userId) {
          throw new Error("User ID not found in token.");
        }

        const data = await UserService.getOrders();
        const currentUserId = decoded.userId;

        const userOrders = data.filter((order: IOrder) => {
          if (typeof order.user === "string") {
            return order.user === currentUserId;
          } else {
            return order.user._id === currentUserId;
          }
        });

        setOrders(userOrders);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load orders");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((order: IOrder) => (
            <li key={order._id} className="border rounded p-4 shadow-sm">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p>
                <strong>User:</strong>{" "}
                {typeof order.user === "string"
                  ? order.user
                  : `${order.user.username} (${order.user.email})`}
              </p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>Total:</strong> €{order.totalAmount.toFixed(2)}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <div className="mt-2">
                <p className="font-semibold">Items:</p>
                <ul className="list-disc list-inside">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {(typeof item.productId === "string"
                        ? item.productId
                        : item.productId.name) + " "}
                      x{item.quantity} - €{item.price}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyOrderList;
