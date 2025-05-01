import { Link, useNavigate } from "react-router-dom"
import AdminMetrics from "./AdminMetrics"
import WelcomePanel from "./WelcomePanel"
import "./AdminPanel.css"

const AdminPanel: React.FC = () => {
    const navigate = useNavigate()
    return (
        <div className="admin-panel">
            <WelcomePanel />
            <h1>Administration Page</h1>

            <AdminMetrics />

            <div className="admin-buttons">
                <div className="admin-button-wrapper">
                    <Link to="/admin/products" className="admin-button">
                        Manage Products
                    </Link>
                </div>
                <div className="admin-button-wrapper">
                    <Link to="/admin/orders" className="admin-button">
                        Manage Orders
                    </Link>
                </div>
                <div className="admin-button-wrapper">
                    <Link to="/admin/categories" className="admin-button">
                        Manage Categories
                    </Link>
                </div>
            </div>

            <button className="button" onClick={() => navigate("/")}>
                Return to Homepage
            </button>
        </div>
    )
}

export default AdminPanel
