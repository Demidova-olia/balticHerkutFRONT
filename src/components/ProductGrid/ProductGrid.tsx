import React from "react";
import { useTranslation } from "react-i18next";

import { Product } from "../../types/product";
import FavoriteIcon from "../Favorite/FavoriteIcon";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./ProductGrid.module.css";

interface Props {
  products: Product[];
}

const ProductGrid: React.FC<Props> = ({ products }) => {
  const { t } = useTranslation("common");

  if (!products || products.length === 0) {
    return <p>{t("noProducts", "No products found.")}</p>;
  }

  return (
    <div className={styles.productGridContainer}>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <div key={product._id} className={styles.productItem}>
            <ProductCard
              product={product}
              accessory={
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <FavoriteIcon productId={product._id} />
                </span>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
