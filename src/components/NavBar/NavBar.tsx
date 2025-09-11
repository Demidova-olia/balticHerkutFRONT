import { useAuth } from "../../hooks/useAuth";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./NavBar.module.css";
import Cart from "../Cart/Cart";
import LanguageSwitcher from "./LanguageSwitcher";

const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(["common"], { keyPrefix: "nav" });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role =
    (user?.role ?? (user as any)?.user?.role ?? "")
      .toString()
      .trim()
      .toUpperCase();
  const isAdmin = Boolean((user as any)?.isAdmin || role === "ADMIN");

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
            {t("home", { defaultValue: "Home" })}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/aboutUs"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {t("about", { defaultValue: "About Us" })}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/productsPage"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {t("products", { defaultValue: "Products" })}
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
                {t("profile", { defaultValue: "Profile" })}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {t("cart", { defaultValue: "Cart" })}
              </NavLink>
            </li>

            {isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                >
                  {t("admin", { defaultValue: "Admin Panel" })}
                </NavLink>
              </li>
            )}

            <li>
              <button onClick={handleLogout} className={styles.logoutButton}>
                {t("logout", { defaultValue: "Logout" })}
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
                {t("login", { defaultValue: "Login" })}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {t("register", { defaultValue: "Register" })}
              </NavLink>
            </li>
          </>
        )}

        <li>
          <LanguageSwitcher />
        </li>

        <li>
          <Cart />
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
