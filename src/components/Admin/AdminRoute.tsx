import { useAuth } from "../../hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";

const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth(); // <= используем loading
  const location = useLocation();

  const role = useMemo(
    () => (user?.role ?? "").toString().trim().toLowerCase(),
    [user]
  );
  const isAdmin = role === "admin" || user?.isAdmin === true;

  // Чтобы toast не срабатывал многократно при каждом ререндере
  const warnedRef = useRef(false);
  useEffect(() => {
    if (!loading && isAuthenticated && user && !isAdmin && !warnedRef.current) {
      toast.error("You do not have permission to view this page");
      warnedRef.current = true;
    }
  }, [loading, isAuthenticated, user, isAdmin]);

  // Пока грузится состояние авторизации — ничего не решаем (или покажи спиннер)
  if (loading) return null; // или <Spinner />

  // Не авторизован — на логин
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Авторизован, но не админ — редирект на forbidden/домой
  if (!isAdmin) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

