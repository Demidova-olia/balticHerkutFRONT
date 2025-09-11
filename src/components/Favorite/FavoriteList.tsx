import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FavoriteService from "../../services/FavoriteService";
import { Product } from "../../types/product";
import { FaTrash, FaCartPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCart } from "../../hooks/useCart";
import { useTranslation } from "react-i18next";
import styles from "./FavoriteList.module.css";

type LocalizedField = {
  ru?: string;
  en?: string;
  fi?: string;
  _source?: string;
  _mt?: Record<string, boolean>;
};

function pickLocalizedName(name: Product["name"], lang: string): string {
  if (typeof name === "string") return name;
  const lf = (name || {}) as LocalizedField;
  const short = (lang || "en").slice(0, 2);
  return (
    lf[short as keyof LocalizedField] ||
    (lf._source ? lf[lf._source as keyof LocalizedField] : "") ||
    lf.en ||
    lf.ru ||
    lf.fi ||
    ""
  ) as string;
}

const FALLBACK_IMG = "/assets/no-image.svg";

function imageFromProduct(p: Product): string {
  const first = p.images?.[0] as any;
  if (!first) return FALLBACK_IMG;
  if (typeof first === "string") return first;
  return first.url ?? FALLBACK_IMG;
}

function numberPrice(val: unknown): number {
  if (typeof val === "number") return val;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

const FavoriteList = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, i18n } = useTranslation("favorites");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError(null);
        const favoritesData = await FavoriteService.getFavorites();
        if (!alive) return;
        setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      } catch (err: unknown) {
        if (!alive) return;
        if (axios.isAxiosError(err) && err.code === "ERR_CANCELED") return;
        setError(
          t("errors.unknown", { defaultValue: "Failed to load favorites." })
        );
      }
    })();

    return () => {
      alive = false;
    };

  }, []);

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      await FavoriteService.removeFromFavorites(productId);
      setFavorites((prev) => prev.filter((fav) => fav._id !== productId));
      toast.success(t("toasts.removed", { defaultValue: "Removed from favorites" }));
    } catch (err: unknown) {
      const msg =
        (err instanceof Error && err.message) ||
        t("errors.unknown", { defaultValue: "Failed to load favorites." });
      setError(msg);
      toast.error(msg);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingId(product._id);
      setError(null);

      const image = imageFromProduct(product);
      const price = numberPrice((product as any).price);
      const nameStr =
        pickLocalizedName(product.name, i18n.language) ||
        t("labels.noName", { defaultValue: "No Name" });

      addToCart({
        id: product._id,
        name: nameStr,
        price,
        quantity: 1,
        image,
      });

      try {
        await FavoriteService.removeFromFavorites(product._id);
      } catch {
        toast.warn(
          t("toasts.addedButNotRemoved", {
            defaultValue: "Added to cart, but failed to remove from favorites",
          })
        );
      }
      setFavorites((prev) => prev.filter((f) => f._id !== product._id));

      toast.success(t("toasts.added", { defaultValue: "Added to cart" }));
    } catch (e: any) {
      const msg = e?.message || t("errors.addToCart", { defaultValue: "Failed to add to cart" });
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
      <h2>{t("title", { defaultValue: "Favorites" })}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {favorites.length === 0 ? (
        <p>{t("empty", { defaultValue: "Nothing here yet." })}</p>
      ) : (
        <ul className={styles.favoriteList}>
          {favorites.map((product) => {
            const img = imageFromProduct(product);
            const nameStr =
              pickLocalizedName(product.name, i18n.language) ||
              t("labels.noName", { defaultValue: "No Name" });

            return (
              <li key={product._id} className={styles.favoriteItem}>
                <div className={styles.productDetails}>
                  <div
                    className={styles.productImageWrapper}
                    onClick={() => handleImageClick(product._id)}
                    style={{ cursor: "pointer" }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleImageClick(product._id);
                    }}
                  >
                    <img
                      className={styles.productImage}
                      src={img}
                      alt={nameStr}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).onerror = null;
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                    />
                  </div>

                  <span className={styles.productName}>{nameStr}</span>

                  <button
                    className={styles.addButton}
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product._id}
                    title={t("buttons.addToCart", { defaultValue: "Add to cart" })}
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
                    {addingId === product._id
                      ? t("buttons.adding", { defaultValue: "Adding..." })
                      : t("buttons.addToCart", { defaultValue: "Add to cart" })}
                  </button>

                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveFromFavorites(product._id)}
                    title={t("buttons.remove", { defaultValue: "Remove" })}
                  >
                    <FaTrash /> {t("buttons.remove", { defaultValue: "Remove" })}
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
