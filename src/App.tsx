import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LaptopsList from "./components/Laptops/LaptopsList";
// import LaptopItem from "./components/Laptops/LaptopItem";
import PhonesList from "./components/Phones/PhonesList";
// import PhoneItem from "./components/Phones/PhoneItem";
import ProductsPage from "./components/Products/ProductsPage";
// import ProductDetail from "./components/Products/ProductDetail";
import TVsList from "./components/TVs/TVsList";
// import TVsItem from "./components/TVs/TVsItem";
import CategoryPage from "./pages/CategoryPage";
import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./components/CartPage/CartPage";
import NotFound from "./pages/NotFound";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import "./App.css";
import ProductDetailPage from "./components/Products/ProductDetailPage";
import MyOrdersPage from "./components/MyOrdersPage/MyOrdersPage";
import AdminRoute from "./components/Admin/AdminRoute";
import AdminPanel from "./components/Admin/AdminPanel";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";
import { ToastContainer } from "react-toastify";
import ProfilePage from "./components/Profile/ProfilePage";
import AdminProducts from "./pages/AdminProducts";
import Cart from "./components/Cart";



function App() {
  return (
    
    <BrowserRouter>
      <ToastContainer />
      <Cart />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          {/* <Route path="/products/:id" element={<ProductDetail />} /> */}
          <Route path="/products/:category" element={<CategoryPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="/laptops" element={<LaptopsList />} />
          <Route path="/phones" element={<PhonesList />} />
          <Route path="/tvs" element={<TVsList />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile/orders" element={<MyOrdersPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products" element={<AdminProducts />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
     
  );
}

export default App;