import { useEffect, useState } from "react";
import { getProducts } from "../../services/ProductService";
import { Product } from "../../types/product";
import styles from "./ProductGrid.module.css";
import { useNavigate } from "react-router";
import { useCart } from "../../hooks/useCart"; // Импортируй хук useCart

interface Props {
  searchTerm: string;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string;
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
  const { addToCart } = useCart(); // Получаем функцию addToCart из useCart хука

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts(
          searchTerm,
          selectedCategoryId ?? undefined,
          selectedSubcategoryId,
          1,
          10
        );
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("An error occurred while fetching products.");
        setProducts([]); // Optional: reset products
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategoryId, selectedSubcategoryId]);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.productGrid}>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        products.map((product) => (
          <div
            key={product._id}
            className={styles.productItem}
            onClick={() => navigate(`/products/${product._id}`)}
          >
            <img
              src={product.images?.[0] ?? "/placeholder.jpg"}
              alt={product.name}
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <button
              className={styles.addToCartBtn}
              onClick={(e) => {
                e.stopPropagation();
                addToCart({
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  quantity: 1, // Можно динамически добавить количество, если нужно
                  image: product.images?.[0] ?? "/placeholder.jpg",
                });
              }}
            >
              Add to cart
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductGrid;
