import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminNavBar.css";

export const AdminNavBar: React.FC = () => {
  return (
    <nav className="admin-navbar">
      <ul>
        <li>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? "active" : "")}>
            Categories
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/subcategories" className={({ isActive }) => (isActive ? "active" : "")}>
            Subcategories
          </NavLink>
        </li>
        {/* Add more links as needed */}
      </ul>
    </nav>
  );
};

