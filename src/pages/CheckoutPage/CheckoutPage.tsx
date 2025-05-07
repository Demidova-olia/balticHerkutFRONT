import axiosInstance from "../../utils/axios";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./CheckoutPage.module.css";
import NavBar from "../../components/NavBar/NavBar";

const CheckoutPage: React.FC = () => {
  const { items, getTotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");

  const navigate = useNavigate();

  const orderSubmitHandler = async () => {
    if (!address.trim()) {
      toast.error("Please enter your address before submitting the order.");
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
        address: address,
      };
      await axiosInstance.post("/orders", orderData);
      clearCart();
      toast.success("Order submitted successfully!");
      navigate("/order-success");
    } catch (error) {
      toast.error("Failed to submit the order. Please try again.");
      setError("Failed to submit the order. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <NavBar/>
        <div className={styles.checkoutContainer}>
        <h1 className={styles.heading}>Order Summary</h1>

        <div className={styles.checkoutItems}>
            {items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
                <h4>{item.name}</h4>
                <p>Quantity: {item.quantity}</p>
                <p>Price: {item.price.toFixed(2)} €</p>
            </div>
            ))}
        </div>

        <h2 className={styles.total}>Total: {getTotal().toFixed(2)} €</h2>

        <div className={styles.addressInput}>
            <label htmlFor="address">Shipping Address:</label>
            <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your delivery address"
            required
            />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button
            className={styles.submitButton}
            onClick={orderSubmitHandler}
            disabled={loading}
        >
            {loading ? "Processing..." : "Confirm Order"}
        </button>
        </div>
    </>
  );
};

export default CheckoutPage;
