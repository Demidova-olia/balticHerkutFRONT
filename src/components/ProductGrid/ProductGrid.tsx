import React from "react";
import "./ProductGrid.scss";
import { Product } from "../../types/product";
import ProductCard from "../ProductCard/ProductCard";
import { useCart } from "../../hooks/useCart";

interface Props {
  products: Product[];
}

const ProductGrid: React.FC<Props> = ({ products }) => {
  const { addToCart } = useCart();

  if (products.length === 0) return <p>No products found.</p>;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={() =>
            addToCart({
              id: product._id,
              name: product.name,
              price: product.price,
              quantity: 1,
              image: product.images?.[0],
            })
          }
        />
      ))}
    </div>
  );
};

export default ProductGrid;

