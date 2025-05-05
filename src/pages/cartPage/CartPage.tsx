import React from "react";
import { useCart } from "../../hooks/useCart";

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image || "/images/no-image.png"} alt={item.name} />
              <div>
                <h4>{item.name}</h4>
                <p>{item.price.toFixed(2)} €</p>
                <div>
                  <label>Quantity: </label>
                  <select
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
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="cart-total">
        <h3>Total: {getTotal().toFixed(2)} €</h3>
      </div>
    </div>
  );
};

export default CartPage;
