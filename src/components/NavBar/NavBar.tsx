import { useAuth } from "../../hooks/useAuth";
import { NavLink, useNavigate } from "react-router-dom";
// import "./NavBar.scss";

const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav>
      <ul>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/products">Products</NavLink></li>
        

        {isAuthenticated && (
          <>
            <li><NavLink to="/profile">Profile</NavLink></li>
            <li><NavLink to="/profile/orders">Orders</NavLink></li>
            <li><NavLink to="/cart">Cart</NavLink></li>

            {user?.role?.toUpperCase() === "ADMIN" && (
              <li><NavLink to="/admin">Admin Panel</NavLink></li>
            )}
            <li>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}

        {!isAuthenticated && (
          <>
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/register">Register</NavLink></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
