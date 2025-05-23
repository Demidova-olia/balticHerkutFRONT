import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/authorization/Login";
import Register from "./pages/authorization/Register";
import HomePage from "./pages/homePage/HomePage";
import AdminRoute from "./components/Admin/AdminRoute";
import AdminPanel from "./pages/adminPages/AdminPanel";
import AdminCategories from "./pages/adminPages/adminCategories/AdminCategories";
import AdminSubcategories from "./pages/adminPages/adminSubcategories/AdminSubcategories";
import AdminProducts from "./pages/adminPages/adminProducts/AdminProducts";
import { ToastContainer } from "react-toastify";
import "./App.css";
import AdminProductCreate from "./pages/adminPages/adminProducts/AdminProductCreate";
import AdminProductEdit from "./pages/adminPages/adminProducts/AdminProductEdit";
import './styles/tailwind.css';
import ProductPage from "./pages/products/ProductPage";
import CartPage from "./pages/cartPage/CartPage";
import ProductsPage from "./pages/products/ProductsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import MyOrdersList from "./components/Orders/MyOrdersList";
import OrderSuccessPage from "./pages/orders/OrderSuccessPage";
import AdminOrders from "./pages/adminPages/adminOrders/AdminOrders";
import EditProfilePage from "./pages/profile/EditProfilePage";


function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
    
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/orders" element={<MyOrdersList />} />

        <Route path="/productsPage" element={<ProductsPage />} />
        <Route path="/product/id/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />

        <Route path="/admin" element={<AdminRoute />}> 
          <Route index element={<AdminPanel />} /> 
          <Route path="products" element={<AdminProducts />} /> 
          <Route path="products/create" element={<AdminProductCreate />} /> 
          <Route path="products/edit/:id" element={<AdminProductEdit />} /> 
          <Route path="categories" element={<AdminCategories />} />
          <Route path="subcategories" element={<AdminSubcategories />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
