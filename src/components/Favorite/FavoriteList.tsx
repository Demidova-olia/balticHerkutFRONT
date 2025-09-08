import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteService from "../../services/FavoriteService";
import { Product } from "../../types/product";
import { FaTrash, FaCartPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCart } from "../../hooks/useCart";
import styles from "./FavoriteList.module.css";

const FavoriteList = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favoritesData = await FavoriteService.getFavorites();
        setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };
    fetchFavorites();
  }, []);

  const imageFromProduct = (p: Product): string => {
    return typeof p.images?.[0] === "string"
      ? (p.images![0] as string)
      : p.images?.[0]?.url ?? "/images/no-image.png";
  };

  const numberPrice = (val: unknown): number => {
    if (typeof val === "number") return val;
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  };

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      await FavoriteService.removeFromFavorites(productId);
      setFavorites((prev) => prev.filter((fav) => fav._id !== productId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingId(product._id);
      setError(null);

      const image = imageFromProduct(product);
      const price = numberPrice((product as any).price);

      addToCart({
        id: product._id,
        name: product.name,
        price,
        quantity: 1,
        image,
      });

      try {
        await FavoriteService.removeFromFavorites(product._id);
      } catch {
        toast.warn("Added to cart, but failed to remove from favorites");
      }
      setFavorites((prev) => prev.filter((f) => f._id !== product._id));

      toast.success("Added to cart");
    } catch (e: any) {
      const msg = e?.message || "Failed to add to cart";
      setError(msg);
      toast.error(msg);
    } finally {
      setAddingId(null);
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
          {favorites.map((product) => {
            const img = imageFromProduct(product);
            return (
              <li key={product._id} className={styles.favoriteItem}>
                <div className={styles.productDetails}>
                  <div
                    className={styles.productImageWrapper}
                    onClick={() => handleImageClick(product._id)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      className={styles.productImage}
                      src={img}
                      alt={product.name || "Product"}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                      }}
                    />
                  </div>

                  <span className={styles.productName}>{product.name}</span>

                  <button
                    className={styles.addButton}
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product._id}
                    title="Add to cart"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#10b981",
                      color: "white",
                      cursor: addingId === product._id ? "default" : "pointer",
                      opacity: addingId === product._id ? 0.7 : 1,
                      marginRight: 8,
                    }}
                  >
                    <FaCartPlus />
                    {addingId === product._id ? "Adding..." : "Add to cart"}
                  </button>

                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveFromFavorites(product._id)}
                    title="Remove from favorites"
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FavoriteList;
