import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product } from "../../types/product";
import { getProductById } from "../../services/ProductService";
import styles from "./ProductPage.module.css";
import { useCart } from "../../hooks/useCart";

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className={styles.centered}>Loading...</div>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!product) return <p className={styles.centered}>Product not found.</p>;

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] ?? "/placeholder.jpg",
      stock: product.stock,
    });
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{product.name}</h1>
      <div className={styles.imageWrapper}>
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className={styles.image}
          />
        )}
      </div>
      <p className={styles.description}>{product.description}</p>
      <p className={styles.price}>€{product.price}</p>
      <p className={styles.stock}>Stock: {product.stock}</p>
      <p className={styles.categoryInfo}>
        Category: {typeof product.category === "object" ? product.category.name : "N/A"} <br />
        Subcategory: {typeof product.subcategory === "object" ? product.subcategory.name : "None"}
      </p>
      <button className={styles.addToCartButton} onClick={handleAddToCart}>
        Add to cart
      </button>
    </div>
  );
};

export default ProductPage;

