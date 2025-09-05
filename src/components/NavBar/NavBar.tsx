import { useAuth } from "../../hooks/useAuth";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";
import Cart from "../Cart/Cart";

const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/aboutUs"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            About Us
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/productsPage"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Products
          </NavLink>
        </li>

        {isAuthenticated ? (
          <>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                Cart
              </NavLink>
            </li>
            {user?.role?.toUpperCase() === "ADMIN" && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                >
                  Admin Panel
                </NavLink>
              </li>
            )}
            <li>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                Register
              </NavLink>
            </li>
          </>
        )}
            <li>    
              <Cart/>
            </li>
      </ul>
      
    </nav>
  );
};

export default NavBar;
