import { Link, useNavigate } from "react-router-dom"
import AdminMetrics from "./AdminMetrics"
import WelcomePanel from "./WelcomePanel"
import "./AdminPanel.css"
import NavBar from "../NavBar/NavBar"

const AdminPanel: React.FC = () => {
    const navigate = useNavigate()
    return (
        <div className="admin-panel">
            <NavBar/>
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
                <div className="admin-button-wrapper">
                    <Link to="/admin/subcategories" className="admin-button">
                        Manage Subcategories
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
