import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./NavBar.module.css";
import Cart from "../Cart/Cart";
import LanguageSwitcher from "./LanguageSwitcher";

const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(["common"], { keyPrefix: "nav" });

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const role =
    (user?.role ?? (user as any)?.user?.role ?? "")
      .toString()
      .trim()
      .toUpperCase();
  const isAdmin = Boolean((user as any)?.isAdmin || role === "ADMIN");

  return (
    <>
      <header className={styles.header}>
        <button
          className={styles.iconBtn}
          aria-label="Open menu"
          aria-controls="mobile-drawer"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          {/* burger icon */}
          <span className={styles.burger} />
        </button>

        <NavLink to="/" className={styles.brand} onClick={() => setOpen(false)}>
          Baltic Herkut
        </NavLink>

        <div className={styles.headerRight}>
          <Link to="/cart" aria-label="Cart" className={styles.iconBtn}>
            <span className={styles.cartGlyph}>🛒</span>
          </Link>
        </div>
      </header>

      <nav className={styles.desktopNav}>
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
              <li className={styles.langInline}>
                <LanguageSwitcher />
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
              <li className={styles.langInline}>
                <LanguageSwitcher />
              </li>
            </>
          )}
        </ul>
      </nav>

      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

      <aside
        id="mobile-drawer"
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Меню</span>
          <button
            className={styles.iconBtn}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <span className={styles.close} />
          </button>
        </div>

        <ul className={styles.drawerList} onClick={() => setOpen(false)}>
          <li><NavLink to="/">{t("home", { defaultValue: "Home" })}</NavLink></li>
          <li><NavLink to="/aboutUs">{t("about", { defaultValue: "About Us" })}</NavLink></li>
          <li><NavLink to="/productsPage">{t("products", { defaultValue: "Products" })}</NavLink></li>

          {isAuthenticated ? (
            <>
              <li><NavLink to="/profile">{t("profile", { defaultValue: "Profile" })}</NavLink></li>
              <li><NavLink to="/cart">{t("cart", { defaultValue: "Cart" })}</NavLink></li>
              {isAdmin && (
                <li><NavLink to="/admin">{t("admin", { defaultValue: "Admin Panel" })}</NavLink></li>
              )}
              <li>
                <button className={styles.logoutMobile} onClick={handleLogout}>
                  {t("logout", { defaultValue: "Logout" })}
                </button>
              </li>
            </>
          ) : (
            <>
              <li><NavLink to="/login">{t("login", { defaultValue: "Login" })}</NavLink></li>
              <li><NavLink to="/register">{t("register", { defaultValue: "Register" })}</NavLink></li>
            </>
          )}
        </ul>

        <div className={styles.drawerFooter}>
          <LanguageSwitcher />
          <div className={styles.cartInDrawer}>
            <Cart />
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavBar;
