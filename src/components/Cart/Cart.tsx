import { useCart } from "../../hooks/useCart";
import { AppBar, Badge, IconButton, Toolbar } from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import styles from './Cart.module.css';

const Cart: React.FC = () => {
  const { items } = useCart();
  const navigate = useNavigate();

  const handleIconClick = () => {
    navigate("/cart");
  };

  return (
    <div className={styles.appBarContainer}>
    <AppBar position="static" className={styles.appBarContainer}>
      <Toolbar className={styles.toolbar}>
        <IconButton edge="end" onClick={handleIconClick} className={styles.iconButton}>
          <Badge badgeContent={items.length} color="error" className={styles.badge}>
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  </div>
  );
};
export default Cart;