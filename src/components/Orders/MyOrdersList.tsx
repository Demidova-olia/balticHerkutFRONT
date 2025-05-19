import React, { useEffect, useState } from "react";
import UserService from "../../services/UserService";
import { IOrder } from "../../types/order"; 
import { IUser } from "../../types/user";

const MyOrderList: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null); 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await UserService.getOrders();
        setOrders(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
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

  const toggleOrderDetails = (orderId: string) => {
    setOpenOrderId((prevOrderId) => (prevOrderId === orderId ? null : orderId)); 
  };

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
              <p>
                <strong>Order ID:</strong>{" "}
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
                    <strong>User:</strong>{" "}
                    {typeof order.user === "string"
                      ? order.user
                      : (order.user as IUser).username}{" "} 
                    ({typeof order.user === "string" ? "Unknown Email" : (order.user as IUser).email})
                  </p>
                  <p><strong>Address:</strong> {order.address}</p>
                  <p><strong>Total:</strong> €{order.totalAmount.toFixed(2)}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <div className="mt-2">
                    <p className="font-semibold">Items:</p>
                    <ul className="list-disc list-inside">
                      {order.items.map((item, idx) => {
                      const productName =
                        typeof item.productId === "string"
                          ? item.productId
                          : (item.productId as { name: string }).name; 

                      return (
                        <li key={idx}>
                          {productName} x{item.quantity} - €{item.price.toFixed(2)}
                        </li>
                      );
                    })}
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
