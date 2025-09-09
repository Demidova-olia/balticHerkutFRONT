import { useEffect, useState } from "react";
import FavoriteService from "../../services/FavoriteService";
import { Product } from "../../types/product";
import { FaHeart } from "react-icons/fa";
import styles from "./FavoriteIcon.module.css";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios"; 

const FavoriteIcon = ({ productId }: { productId: string }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    let mounted = true;

    const fetchFavorites = async () => {
      if (!isAuthenticated) return;
      try {

        const favoritesData = await FavoriteService.getFavorites();
        if (!mounted) return;
        setFavorites(favoritesData);
      } catch (err: any) {

        if (
          axios.isCancel?.(err) ||
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.message === "canceled"
        ) {
          return;
        }
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };

    fetchFavorites();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !token) {
      window.location.href = "/login";
      return;
    }

    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);

    try {
      const isAlreadyFavorite = favorites.some((fav) => fav._id === productId);

      if (isAlreadyFavorite) {
        await FavoriteService.removeFromFavorites(productId);
        setFavorites((prev) => prev.filter((fav) => fav._id !== productId));
      } else {
        const addedProduct = await FavoriteService.addToFavorites(productId);
        setFavorites((prev) => [...prev, addedProduct]);
      }
    } catch (err: any) {
      if (
        axios.isCancel?.(err) ||
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError" ||
        err?.message === "canceled"
      ) {
        return;
      }
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const isFavorite = favorites.some((fav) => fav._id === productId);

  const iconClass = `
    ${styles.icon}
    ${isFavorite ? styles.favorite : styles.notFavorite}
    ${isPulsing ? styles.pulse : ""}
  `.trim();

  return (
    <div>
      <FaHeart
        onClick={handleToggleFavorite}
        className={iconClass}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      />
      {error && error !== "canceled" && (
        <p style={{ color: "red", margin: 0 }}>{error}</p>
      )}
    </div>
  );
};

export default FavoriteIcon;
