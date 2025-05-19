// ProductGrid.tsx
import { Product } from "../../types/product";
import styles from "./ProductGrid.module.css";
import { useNavigate } from "react-router";
import { useCart } from "../../hooks/useCart";
import FavoriteIcon from "../Favorite/FavoriteIcon";
import { isAuthenticated } from "../../utils/authUtils";

interface Props {
  products: Product[];
}

const ProductGrid = ({ products }: Props) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  return (
    <div className={styles.productGridContainer}>
      <div className={styles.productGrid}>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product) => {
            const image =
              typeof product.images?.[0] === "string"
                ? product.images[0]
                : product.images?.[0]?.url ?? "/placeholder.jpg";

            return (
              <div key={product._id} className={styles.productItem}>
                <div
                  className={styles.productImageWrapper}
                  onClick={() => navigate(`/product/id/${product._id}`)}
                >
                  <img
                    className={styles.productImage}
                    src={image}
                    alt={product.name}
                  />
                </div>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDics}>{product.description}</p>
                <p className={styles.productPrice}>Price: €{product.price}</p>
                <div className={styles.CartBtnAndFav}>
                  <button
                    className={styles.addToCartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: image,
                      });
                    }}
                  >
                    Add to cart
                  </button>
                  {isAuthenticated() && <FavoriteIcon productId={product._id} />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
