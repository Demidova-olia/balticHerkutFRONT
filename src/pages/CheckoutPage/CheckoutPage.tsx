import axiosInstance from "../../utils/axios";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CheckoutPage: React.FC = () => {
  const { items, getTotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  
  const navigate = useNavigate();

  const orderSubmitHandler = async () => {
    if (!address.trim()) {
      toast.error("Įveskite adresą prieš pateikdami užsakymą.");
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
      toast.success("Užsakymas pateiktas sėkmingai!");
      navigate("/order-success");
    } catch (error) {
      toast.error("Nepavyko pateikti užsakymo. Bandykite dar kartą.");
      setError("Nepavyko pateikti užsakymo. Bandykite dar kartą.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Užsakymo apžvalga</h1>

      <div className="checkout-items">
        {items.map((item) => (
          <div key={item.id}>
            <h4>{item.name}</h4>
            <p>Kiekis: {item.quantity}</p>
            <p>Kaina: {item.price.toFixed(2)} €</p>
          </div>
        ))}
      </div>

      <h2>Bendra suma: {getTotal().toFixed(2)} €</h2>

      <div className="address-input">
        <label htmlFor="address">Pristatymo adresas:</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Įveskite savo pristatymo adresą"
          required
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button
        className="add-to-cart"
        onClick={orderSubmitHandler}
        disabled={loading}
      >
        {loading ? "Vykdoma..." : "Patvirtinti užsakyti"}
      </button>
    </div>
  );
};

export default CheckoutPage;
