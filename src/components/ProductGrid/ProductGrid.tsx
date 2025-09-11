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

const FALLBACK_IMG = "/assets/no-image.svg";

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
          const raw = product?.images?.[0] as any;
          const image =
            typeof raw === "string"
              ? raw
              : raw?.url || FALLBACK_IMG;

          const price =
            typeof product.price === "number" ? product.price : 0;

          const nameStr =
            pickLocalized((product as any).name, i18n.language) ||
            t("product.noName", "No Name");

          const descStr =
            pickLocalized((product as any).description, i18n.language) ||
            t("product.noDescription", "No description available.");

          return (
            <div
              key={product._id}
              className={styles.productItem}
              onClick={() => navigate(`/product/id/${product._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/product/id/${product._id}`);
                }
              }}
            >
              <div className={styles.imageBox}>
                <img
                  className={styles.productImage}
                  src={image}
                  alt={nameStr || "Product"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).onerror = null;
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
              </div>

              <h3 className={styles.productName}>{nameStr}</h3>

              <p className={styles.productDesc}>{descStr}</p>

              <p className={styles.productPrice}>
                {t("product.priceLabel", "Price")}: €{price.toFixed(2)}
              </p>

              <div className={styles.actions}>
                <button
                  className={styles.addToCartBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      id: product._id,
                      name: nameStr,
                      price,
                      quantity: 1,
                      image,
                    });
                  }}
                >
                  {t("product.addToCart", "Add to cart")}
                </button>

                {isAuthenticated() && (
                  <span
                    className={styles.favWrapper}
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
