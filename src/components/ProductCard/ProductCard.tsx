import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import "./ProductCard.scss";
import { Product } from "../../types/product";
import { useTranslation } from "react-i18next";

type ProductCardProps = {
  product: Product;
  onAddToCart?: () => void;
};

function pickLocalizedName(name: unknown, lang: string): string {
  if (typeof name === "string") return name;
  const obj = name as Record<string, any> | undefined;
  const short = (lang || "en").slice(0, 2);

  return (
    obj?.[short] ||
    (obj?._source ? obj?.[obj._source] : "") ||
    obj?.en ||
    obj?.ru ||
    obj?.fi ||
    "No Name"
  );
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { _id, name, price, images } = product;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const { t, i18n } = useTranslation("common");

  const imageUrl =
    typeof images?.[0] === "string"
      ? images[0]
      : images?.[0]?.url ?? "/images/no-image.png";

  const localizedName = pickLocalizedName(name as unknown, i18n.language);
  const numericPrice = Number(price ?? 0);

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    } else {
      addToCart({
        id: _id,
        name: localizedName, 
        price: numericPrice,
        quantity,
        image: imageUrl,
      });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  return (
    <div className="product-card">
      <Link to={`/product/${_id}`}>
        <img
          className="product-image"
          src={imageUrl}
          alt={localizedName}  
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/no-image.png";
          }}
        />
        <h4>{localizedName}</h4> 
        <p>{fmtEUR(numericPrice)}</p>
      </Link>

      <div className="quantity-selector">
        <label htmlFor={`quantity-${_id}`}>
          {t("product.quantity", { defaultValue: "Quantity:" })}
        </label>
        <select
          id={`quantity-${_id}`}
          value={quantity}
          onChange={handleQuantityChange}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <button className="add-to-cart" onClick={handleAddToCart}>
        {t("product.addToCart", { defaultValue: "Add to cart" })}
      </button>
    </div>
  );
};

export default ProductCard;
