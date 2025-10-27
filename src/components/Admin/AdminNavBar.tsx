// src/components/Admin/AdminNavBar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./AdminNavBar.module.css";
import LanguageSwitcher from "../NavBar/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const AdminNavBar: React.FC = () => {
  const { t } = useTranslation("common");

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
            {t("admin.panel.dashboard", { defaultValue: "Dashboard" })}
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {t("admin.panel.buttons.categories", { defaultValue: "Categories" })}
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="/admin/subcategories"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {t("admin.panel.buttons.subcategories", { defaultValue: "Subcategories" })}
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {t("admin.panel.buttons.products", { defaultValue: "Products" })}
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {t("admin.panel.buttons.orders", { defaultValue: "Orders" })}
          </NavLink>
        </li>

        <li className={`${styles.navItem} ${styles.langItem}`}>
          <LanguageSwitcher />
        </li>
      </ul>
    </nav>
  );
};
