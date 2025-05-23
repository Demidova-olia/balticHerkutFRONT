import React from "react";
import { useCart } from "../../hooks/useCart";
import styles from "./CartPage.module.css";
import NavBar from "../../components/NavBar/NavBar";
import { useNavigate } from "react-router-dom";
import FavoriteList from "../../components/Favorite/FavoriteList";

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate(); 

  const handleCheckout = () => {
    navigate("/checkout"); 
  };

  return (
    <>
        <NavBar />
        <div className={styles.cartPage}>
        
        <h2 className={styles.cartTitle}>Your Cart</h2>
        {items.length === 0 ? (
            <p className={styles.emptyMessage}>Your cart is empty</p>
        ) : (
            <div className={styles.cartItems}>
            {items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                <img
                    src={item.image || "/images/no-image.png"}
                    alt={item.name}
                    className={styles.itemImage}
                />
                <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <p className={styles.itemPrice}>{item.price.toFixed(2)} €</p>
                    <div className={styles.itemQuantity}>
                    <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                    <select
                        id={`quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value))
                        }
                    >
                        {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1}
                        </option>
                        ))}
                    </select>
                    </div>
                    <button
                    className={styles.removeButton}
                    onClick={() => removeFromCart(item.id)}
                    >
                    Remove
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
        <div className={styles.cartTotal}>
            <h3>Total: {getTotal().toFixed(2)} €</h3>
        </div>
        <button
            className={styles.checkoutButton}
            onClick={handleCheckout} 
            disabled={items.length === 0} 
        >
            Proceed to Checkout
        </button>
        <FavoriteList />
        </div>
        
    </>
  );
};

export default CartPage;

