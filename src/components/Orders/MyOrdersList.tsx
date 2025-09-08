import React, { useEffect, useMemo, useState } from "react";
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
        setOrders(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    setOpenOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // --- helpers ---

  const isPopulatedProduct = (p: any): p is { name?: string; price?: number } =>
    p && typeof p === "object";

  const getProductName = (productId: unknown): string => {
    if (typeof productId === "string") return productId || "Unknown product";
    if (isPopulatedProduct(productId) && typeof productId.name === "string")
      return productId.name || "Unknown product";
    return "Unknown product";
    // случаи: null/undefined -> Unknown product
  };

  const getItemPrice = (item: any): number => {
    // item.price может быть числом
    if (item && typeof item.price === "number") return item.price;
    // или внутри productId.price
    if (isPopulatedProduct(item?.productId) && typeof item.productId.price === "number")
      return item.productId.price;
    return 0;
  };

  const getUserName = (user: unknown): string => {
    if (typeof user === "string") return user || "Unknown user";
    const u = user as IUser | undefined;
    return u?.username || "Unknown user";
  };

  const getUserEmail = (user: unknown): string => {
    if (typeof user === "string") return "Unknown Email";
    const u = user as IUser | undefined;
    return u?.email || "Unknown Email";
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
          {orders.map((order) => (
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
                    <strong>User:</strong> {getUserName(order.user)} ({getUserEmail(order.user)})
                  </p>
                  <p>
                    <strong>Address:</strong> {order.address || "—"}
                  </p>
                  <p>
                    <strong>Total:</strong>{" "}
                    €{Number(order.totalAmount || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                  </p>

                  <div className="mt-2">
                    <p className="font-semibold">Items:</p>
                    <ul className="list-disc list-inside">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                          const name = getProductName((item as any)?.productId);
                          const price = getItemPrice(item as any);
                          const qty = Number((item as any)?.quantity || 0);
                          return (
                            <li key={(item as any)?._id ?? `${order._id}-${idx}`}>
                              {name} ×{qty} — €{Number(price).toFixed(2)}
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
