import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/authorization/Login";
import Register from "./pages/authorization/Register";
import HomePage from "./pages/homePage/HomePage";
import AdminRoute from "./components/Admin/AdminRoute";
import AdminPanel from "./components/Admin/AdminPanel";
import AdminCategories from "./pages/adminPages/adminCategories/AdminCategories";
import AdminSubcategories from "./pages/adminPages/adminSubcategories/AdminSubcategories";
import AdminProducts from "./pages/adminPages/adminProducts/AdminProducts";
import { ToastContainer } from "react-toastify";
import "./App.css";
import AdminProductCreate from "./pages/adminPages/adminProducts/AdminProductCreate";
import AdminProductEdit from "./pages/adminPages/adminProducts/AdminProductEdit";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
    
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

    
        <Route path="/admin" element={<AdminRoute />}> 
          <Route index element={<AdminPanel />} /> 
          <Route path="products" element={<AdminProducts />} /> 
          <Route path="products/create" element={<AdminProductCreate />} /> 
          <Route path="products/edit/:id" element={<AdminProductEdit />} /> 
          <Route path="categories" element={<AdminCategories />} />
          <Route path="subcategories" element={<AdminSubcategories />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
