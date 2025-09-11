// src/components/ProductGrid/ProductGrid.tsx
import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Product } from "../../types/product";
import { useCart } from "../../hooks/useCart";
import FavoriteIcon from "../Favorite/FavoriteIcon";
import { isAuthenticated } from "../../utils/authUtils";
import styles from "./ProductGrid.module.css";

interface Props {
  products: Product[];
}

// Универсальный выбор локализованной строки на клиенте
function pickLocalized(value: unknown, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  const v = value as Record<string, any>;
  const byLang = v?.[lang];
  if (typeof byLang === "string" && byLang.trim()) return byLang;

  const src = typeof v?._source === "string" ? v._source : "en";
  if (typeof v?.[src] === "string" && v[src].trim()) return v[src];

  if (typeof v?.ru === "string" && v.ru.trim()) return v.ru;
  if (typeof v?.en === "string" && v.en.trim()) return v.en;
  if (typeof v?.fi === "string" && v.fi.trim()) return v.fi;

  return "";
}

const ProductGrid: React.FC<Props> = ({ products }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { i18n, t } = useTranslation("common");

  if (!products || products.length === 0) {
    return <p>{t("noProducts", "No products found.")}</p>;
  }

  return (
    <div className={styles.productGridContainer}>
      <div className={styles.productGrid}>
        {products.map((product) => {
          const image =
            typeof product.images?.[0] === "string"
              ? product.images[0]
              : product.images?.[0]?.url || "/placeholder.jpg";

          const priceText =
            typeof product.price === "number" ? product.price.toFixed(2) : "N/A";

          const nameStr =
            pickLocalized((product as any).name, i18n.language) || t("product.noName", "No Name");
          const descStr =
            pickLocalized((product as any).description, i18n.language) ||
            t("product.noDescription", "No description available.");

          return (
            <div key={product._id} className={styles.productItem}>
              <div
                className={styles.productImageWrapper}
                onClick={() => navigate(`/product/id/${product._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/product/id/${product._id}`);
                  }
                }}
              >
                <img
                  className={styles.productImage}
                  src={image}
                  alt={nameStr || "Product"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
              </div>

              <h3 className={styles.productName}>{nameStr}</h3>

              <p className={styles.productDics}>{descStr}</p>

              <p className={styles.productPrice}>
                {t("product.priceLabel", "Price")}: €{priceText}
              </p>

              <div className={styles.CartBtnAndFav}>
                <button
                  className={styles.addToCartBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      id: product._id,
                      name: nameStr, // строка, а не LocalizedField
                      price: typeof product.price === "number" ? product.price : 0,
                      quantity: 1,
                      image,
                    });
                  }}
                >
                  {t("product.addToCart", "Add to cart")}
                </button>

                {isAuthenticated() && (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <FavoriteIcon productId={product._id} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
