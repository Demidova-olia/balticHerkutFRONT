import { Link, useNavigate } from "react-router-dom"
import AdminMetrics from "../../components/Admin/AdminMetrics"
import WelcomePanel from "../../components/Admin/WelcomePanel"
import NavBar from "../../components/NavBar/NavBar"
import styles from "./AdminPanel.module.css"

const AdminPanel: React.FC = () => {
    const navigate = useNavigate()
    return (
        <div className={styles.adminPanel}>
            <NavBar/>
            <WelcomePanel />
            <h1>Administration Page</h1>

            <AdminMetrics />

            <div className={styles.adminButtons}>
                <div className={styles.adminButtonWrapper}>
                    <Link to="/admin/products" className={styles.adminButton}>
                        Manage Products
                    </Link>
                </div>
                <div className={styles.adminButtonWrapper}>
                    <Link to="/admin/orders" className={styles.adminButton}>
                        Manage Orders
                    </Link>
                </div>
                <div className={styles.adminButtonWrapper}>
                    <Link to="/admin/categories" className={styles.adminButton}>
                        Manage Categories
                    </Link>
                </div>
                <div className={styles.adminButtonWrapper}>
                    <Link to="/admin/subcategories" className={styles.adminButton}>
                        Manage Subcategories
                    </Link>
                </div>
            </div>

            <button className={styles.button} onClick={() => navigate("/")}>
                Return to Homepage
            </button>
        </div>
    )
}

export default AdminPanel
