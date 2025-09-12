// AdminPanel.tsx
import { Link, useNavigate } from "react-router-dom";
import AdminMetrics from "../../components/Admin/AdminMetrics";
import WelcomePanel from "../../components/Admin/WelcomePanel";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./AdminPanel.module.css";
import { useTranslation } from "react-i18next";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.adminPanel}>
        <h1>{t("admin.panel.title", { defaultValue: "Administration Page" })}</h1>

        <WelcomePanel />
        <AdminMetrics />

        <div className={styles.adminButtons}>
          <div className={styles.adminButtonWrapper}>
            <Link to="/admin/products" className={styles.adminButton}>
              {t("admin.panel.buttons.products", { defaultValue: "Manage Products" })}
            </Link>
          </div>
          <div className={styles.adminButtonWrapper}>
            <Link to="/admin/orders" className={styles.adminButton}>
              {t("admin.panel.buttons.orders", { defaultValue: "Manage Orders" })}
            </Link>
          </div>
          <div className={styles.adminButtonWrapper}>
            <Link to="/admin/categories" className={styles.adminButton}>
              {t("admin.panel.buttons.categories", { defaultValue: "Manage Categories" })}
            </Link>
          </div>
          <div className={styles.adminButtonWrapper}>
            <Link to="/admin/subcategories" className={styles.adminButton}>
              {t("admin.panel.buttons.subcategories", { defaultValue: "Manage Subcategories" })}
            </Link>
          </div>
        </div>

        <button className={styles.button} onClick={() => navigate("/")}>
          {t("admin.panel.backHome", { defaultValue: "Return to Homepage" })}
        </button>
      </main>
    </div>
  );
};

export default AdminPanel;
