import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useEffect, useMemo, useState } from "react";
import "./ProductCard.scss";
import { Product } from "../../types/product";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (qty?: number) => void;
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

  const stock = Number(product?.stock ?? 0);
  const isOutOfStock = !Number.isFinite(stock) || stock <= 0;

  const { addToCart, items } = useCart();

  const inCartAlready = useMemo(() => {
    const found = items.find((i) => i.id === _id);
    return Number(found?.quantity ?? 0);
  }, [items, _id]);

  const [quantity, setQuantity] = useState<number>(1);

  const { t, i18n } = useTranslation("common");

  useEffect(() => {
    const remaining = Math.max(0, stock - inCartAlready);
    if (remaining <= 0) {
      setQuantity(0);
    } else {
      setQuantity((q) => Math.max(1, Math.min(q || 1, Math.min(10, remaining))));
    }
  }, [stock, inCartAlready]);

  const imageUrl = useMemo(() => {
    return typeof images?.[0] === "string"
      ? images[0]
      : images?.[0]?.url ?? "/images/no-image.png";
  }, [images]);

  const localizedName = useMemo(
    () => pickLocalizedName(name as unknown, i18n.language),
    [name, i18n.language]
  );

  const numericPrice = Number(price ?? 0);

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const remaining = Math.max(0, stock - inCartAlready);

  const handleAddToCart = () => {
    if (remaining <= 0) {
      toast.info(t("product.noMoreStock", { defaultValue: "No more stock available." }));
      return;
    }

    const toAdd = Math.max(0, Math.min(quantity, remaining));
    if (toAdd <= 0) {
      toast.info(t("product.noMoreStock", { defaultValue: "No more stock available." }));
      return;
    }

    if (onAddToCart) {
      onAddToCart(toAdd);
    } else {

      addToCart({
        id: _id,
        name: localizedName,
        price: numericPrice,
        quantity: toAdd,
        image: imageUrl,
        stock: Number.isFinite(stock) ? stock : undefined,
      });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!Number.isFinite(val)) return;
    const clamped = Math.max(1, Math.min(val, Math.min(10, remaining)));
    setQuantity(clamped);
  };

  const btnClass = `add-to-cart ${remaining <= 0 ? "out-of-stock" : ""}`;

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

      {remaining > 0 ? (
        <div className="quantity-selector">
          <label htmlFor={`quantity-${_id}`}>
            {t("product.quantity", { defaultValue: "Quantity:" })}
          </label>
          <select
            id={`quantity-${_id}`}
            value={Math.min(quantity, remaining)}
            onChange={handleQuantityChange}
          >
            {Array.from({ length: Math.min(10, remaining) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <small aria-live="polite" style={{ display: "block", marginTop: 6 }}>
            {t("product.remaining", { defaultValue: "Remaining" })}: {remaining}
          </small>
        </div>
      ) : (
        <div className="quantity-selector" aria-live="polite">
          {t("product.outOfStock", { defaultValue: "Out of stock" })}
        </div>
      )}

      <button
        className={btnClass}
        onClick={handleAddToCart}
        disabled={remaining <= 0}
        aria-disabled={remaining <= 0}
        title={
          remaining <= 0
            ? t("product.outOfStock", { defaultValue: "Out of stock" })
            : t("product.addToCart", { defaultValue: "Add to cart" })
        }
      >
        {remaining <= 0
          ? t("product.outOfStock", { defaultValue: "Out of stock" })
          : t("product.addToCart", { defaultValue: "Add to cart" })}
      </button>
    </div>
  );
};

export default ProductCard;
