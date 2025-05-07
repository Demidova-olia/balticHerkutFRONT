import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./AdminNavBar.module.css";

export const AdminNavBar: React.FC = () => {
  return (
    <nav className={styles.adminNavbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Categories
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            to="/admin/subcategories"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Subcategories
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Products
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Orders
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
