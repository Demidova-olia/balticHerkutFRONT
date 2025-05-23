import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteService from "../../services/FavoriteService";
import { Product } from "../../types/product";
import { FaTrash } from "react-icons/fa";
import styles from "./FavoriteList.module.css";

const FavoriteList = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favoritesData = await FavoriteService.getFavorites();
        setFavorites(favoritesData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };
    fetchFavorites();
  }, []);

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      await FavoriteService.removeFromFavorites(productId);
      setFavorites((prev) => prev.filter((fav) => fav._id !== productId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const handleImageClick = (productId: string) => {
    navigate(`/product/id/${productId}`);
  };

  return (
    <div>
      <h2>Your Favorite Products</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {favorites.length === 0 ? (
        <p>No favorites available.</p>
      ) : (
        <ul className={styles.favoriteList}>
          {favorites.map((product) => (
            <li key={product._id} className={styles.favoriteItem}>
              <div className={styles.productDetails}>
                <div
                  className={styles.productImageWrapper}
                  onClick={() => handleImageClick(product._id)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className={styles.productImage}
                    src={product.images?.[0]?.url ?? "/placeholder.jpg"}
                    alt={product.name}
                  />
                </div>
                <span className={styles.productName}>{product.name}</span>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveFromFavorites(product._id)}
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoriteList;
