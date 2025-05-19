import { useEffect, useState } from "react";
import { getProducts } from "../../services/ProductService";
import { Product } from "../../types/product";
import styles from "./ProductGrid.module.css";
import { useNavigate } from "react-router";
import { useCart } from "../../hooks/useCart";
import FavoriteIcon from "../Favorite/FavoriteIcon";
import { isAuthenticated } from "../../utils/authUtils";

interface Props {
  searchTerm: string;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
}

const ProductGrid = ({
  searchTerm,
  selectedCategoryId,
  selectedSubcategoryId,
}: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProducts(
          searchTerm,
          selectedCategoryId ?? "",
          selectedSubcategoryId ?? "",
          1,
          10
        );
        setProducts(response.products);
      } catch (err: unknown) {
        console.error("Error fetching products:", err);
        setError("An error occurred while fetching products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategoryId, selectedSubcategoryId]);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>{error}</div>;

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
                <p className={styles.productDesc}>{product.description}</p>
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
