// src/pages/products/ProductPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Product } from "../../types/product";
import { Review } from "../../types/review";
import { getProductById } from "../../services/ProductService";
import ReviewService from "../../services/ReviewService";
import styles from "./ProductPage.module.css";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { AxiosError } from "axios";
import NavBar from "../../components/NavBar/NavBar";
import FavoriteIcon from "../../components/Favorite/FavoriteIcon";

function useLocalizedPicker() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2).toLowerCase();

  return useMemo(() => {
    const order = Array.from(
      new Set([lang, "en", "ru", "fi"].filter(Boolean) as string[])
    );
    const pick = (val: unknown): string => {
      if (!val) return "";
      if (typeof val === "string") return val;
      if (typeof val === "object") {
        const obj = val as Record<string, unknown>;
        for (const l of order) {
          const v = obj[l];
          if (typeof v === "string" && v.trim()) return v;
        }

        const src = (obj["_source"] as string | undefined)?.toLowerCase();
        if (src && typeof obj[src] === "string") return String(obj[src]);
      }
      return "";
    };
    return pick;
  }, [lang]);
}

const ProductPage: React.FC = () => {
  const { t } = useTranslation("common");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { isAuthenticated, token, user } = useAuth();
  const { addToCart } = useCart();

  const pick = useLocalizedPicker();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError(t("product.errors.noId", "No product ID provided"));
        setLoading(false);
        return;
      }
      try {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : t("common.unexpected", "Unexpected error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, t]);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    try {
      const fetchedReviews = await ReviewService.getProductReviews(id);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Failed to load reviews", error);
    }
  }, [id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleAddToCart = () => {
    if (!product) return;

    const imageUrl =
      typeof product.images?.[0] === "string"
        ? product.images[0]
        : product.images?.[0]?.url ?? "/placeholder.jpg";

    const displayName = pick(product.name) || t("product.noName", "No Name");

    addToCart({
      id: product._id,
      name: displayName, 
      price: product.price ?? 0,
      quantity: 1,
      image: imageUrl,
      stock: product.stock,
    });
  };

  const userReview = isAuthenticated
    ? reviews.find((r) => {
        const reviewUserId = typeof r.userId === "object" ? r.userId._id : r.userId;
        return reviewUserId === user?.id;
      })
    : null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    try {
      if (editing && editingReviewId) {
        await ReviewService.updateReview(editingReviewId, { rating, comment });
      } else {
        await ReviewService.createReview(id, { rating, comment });
      }

      setRating(5);
      setComment("");
      setEditing(false);
      setEditingReviewId(null);
      loadReviews();
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Review submission error:", axiosError);
        alert(t("reviews.submitError", "Failed to submit review. Try again later."));
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await ReviewService.deleteReview(reviewId);
      loadReviews();
    } catch (error) {
      console.error("Failed to delete review", error);
      alert(t("reviews.deleteError", "Error deleting review."));
    }
  };

  if (loading) return <div className={styles.centered}>{t("common.loading", "Loading...")}</div>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!product) return <p className={styles.centered}>{t("product.notFound", "Product not found.")}</p>;

  const productImage =
    typeof product.images?.[0] === "string"
      ? product.images[0]
      : product.images?.[0]?.url ?? "/placeholder.jpg";

  const displayName = pick(product.name) || t("product.noName", "No Name");
  const displayDesc = pick(product.description) || "";
  const categoryName =
    typeof product.category === "object"
      ? pick((product.category as any)?.name) || t("product.na", "N/A")
      : t("product.na", "N/A");
  const subcategoryName =
    typeof product.subcategory === "object"
      ? pick((product.subcategory as any)?.name) || t("product.none", "None")
      : t("product.none", "None");

  return (
    <>
      <NavBar />
      <div className={styles.pageContainer}>
        <h1 className={styles.title}>{displayName}</h1>

        <div className={styles.imageWrapper}>
          <img src={productImage} alt={displayName} />
        </div>

        <p className={styles.description}>{displayDesc}</p>

        <p className={styles.price}>
          €{(product.price ?? 0).toFixed(2)}
        </p>

        <p className={styles.stock}>
          {t("product.stock", "Stock")}: {product.stock}
        </p>

        <p className={styles.categoryInfo}>
          {t("product.category", "Category")}: {categoryName} <br />
          {t("product.subcategory", "Subcategory")}: {subcategoryName}
        </p>

        <div className={styles.actionRow}>
          <button className={styles.addToCartButton} onClick={handleAddToCart}>
            {t("product.addToCart", "Add to cart")}
          </button>
          <span className={styles.favoriteIconWrapper}>
            <FavoriteIcon productId={product._id} />
          </span>
        </div>

        <hr className={styles.divider} />

        <section className={styles.reviewsSection}>
          <h2>{t("reviews.title", "Reviews")}</h2>

          {reviews.length === 0 ? (
            <p>{t("reviews.none", "No reviews yet.")}</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className={styles.reviewItem}>
                <strong>{t("reviews.rating", "Rating")}:</strong> {review.rating}/5
                {review.comment && <p>{review.comment}</p>}
                <small>
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>

                {isAuthenticated &&
                  (typeof review.userId === "object" ? review.userId._id : review.userId) ===
                    user?.id && (
                    <div className={styles.reviewActions}>
                      <button
                        onClick={() => {
                          setEditing(true);
                          setEditingReviewId(review._id);
                          setRating(review.rating);
                          setComment(review.comment || "");
                        }}
                      >
                        {t("reviews.edit", "Edit")}
                      </button>
                      <button onClick={() => handleDeleteReview(review._id)}>
                        {t("reviews.delete", "Delete")}
                      </button>
                    </div>
                  )}
              </div>
            ))
          )}

          {isAuthenticated && !editing && !userReview && (
            <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
              <h3>{t("reviews.leave", "Leave a Review")}</h3>
              <label>
                {t("reviews.ratingLabel", "Rating")}:
                <select value={rating} onChange={(e) => setRating(+e.target.value)}>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("reviews.placeholder", "Write your comment...")}
                required
              />
              <button type="submit">{t("reviews.submit", "Submit")}</button>
            </form>
          )}

          {isAuthenticated && editing && (
            <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
              <h3>{t("reviews.editYour", "Edit Your Review")}</h3>
              <label>
                {t("reviews.ratingLabel", "Rating")}:
                <select value={rating} onChange={(e) => setRating(+e.target.value)}>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("reviews.updatePlaceholder", "Update your comment...")}
                required
              />
              <button type="submit">{t("reviews.update", "Update")}</button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditingReviewId(null);
                  setRating(5);
                  setComment("");
                }}
              >
                {t("reviews.cancel", "Cancel")}
              </button>
            </form>
          )}

          {!isAuthenticated && (
            <p>
              <a href="/login">{t("reviews.loginToReview", "Log in")}</a>{" "}
              {t("reviews.toLeave", "to leave a review.")}
            </p>
          )}
        </section>
      </div>
    </>
  );
};

export default ProductPage;
