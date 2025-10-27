import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useEffect, useMemo, useState } from "react";
import "./ProductCard.scss";
import { Product } from "../../types/product";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import emailjs from "emailjs-com";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (qty?: number) => void;
  accessory?: React.ReactNode; // сердечко и т.п.
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

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  accessory,
}) => {
  const navigate = useNavigate();
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

  // ====== Добавлено: обработка "Интересует товар" ======
  const handleInterest = async () => {
    try {
      await emailjs.send(
        "your_service_id", // ⚙️ вставь свой Service ID из EmailJS
        "your_template_id", // ⚙️ вставь Template ID
        {
          product_name: localizedName,
          product_id: _id,
          message: `User is interested in "${localizedName}" (ID: ${_id}).`,
        },
        "your_public_key" // ⚙️ вставь свой Public Key из EmailJS
      );
      toast.success(
        t("product.interestSent", {
          defaultValue: "Your request has been sent!",
        })
      );
    } catch (err) {
      console.error("Email send failed:", err);
      toast.error(
        t("product.interestFail", {
          defaultValue: "Failed to send interest message.",
        })
      );
    }
  };
  // =====================================================

  const handleAddToCart = () => {
    if (remaining <= 0) {
      toast.info(
        t("product.noMoreStock", { defaultValue: "No more stock available." })
      );
      return;
    }

    const toAdd = Math.max(0, Math.min(quantity, remaining));
    if (toAdd <= 0) {
      toast.info(
        t("product.noMoreStock", { defaultValue: "No more stock available." })
      );
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

  const onCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(
        "button, a, select, input, textarea, [role='button'], .footer-accessory"
      )
    ) {
      return;
    }
    navigate(`/product/id/${_id}`);
  };

  const onCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/product/id/${_id}`);
    }
  };

  const btnClass = `add-to-cart ${remaining <= 0 ? "out-of-stock" : ""}`;
  const cardClass = `product-card ${remaining <= 0 ? "product-card--oos" : ""}`;

  return (
    <div
      className={cardClass}
      onClick={onCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={onCardKeyDown}
      aria-label={localizedName}
    >
      <Link to={`/product/id/${_id}`} className="media" aria-label={localizedName}>
        <img
          className="product-image"
          src={imageUrl}
          alt={localizedName}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/no-image.png";
          }}
        />
        {remaining <= 0 && (
          <span className="badge badge--oos">
            {t("product.outOfStock", { defaultValue: "Out of stock" })}
          </span>
        )}
      </Link>

      <div className="body">
        <h4 title={localizedName}>{localizedName}</h4>
        <div className="price">{fmtEUR(numericPrice)}</div>
        {remaining > 0 ? (
          <div className="muted">
            {t("product.inStock", { defaultValue: "In stock" })}: {remaining}
          </div>
        ) : (
          <div className="muted">
            {t("product.outOfStock", { defaultValue: "Out of stock" })}
          </div>
        )}
      </div>

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
            {Array.from({ length: Math.min(10, remaining) }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
        </div>
      ) : null}

      <div className="footer">
        {remaining <= 0 ? (
          <button
            className="interest-btn"
            onClick={handleInterest}
            title={t("product.notifyInterest", {
              defaultValue: "Notify me when available",
            })}
          >
            {t("product.notifyInterest", {
              defaultValue: "Notify me when available",
            })}
          </button>
        ) : (
          <button
            className={btnClass}
            onClick={handleAddToCart}
            disabled={remaining <= 0}
            aria-disabled={remaining <= 0}
            title={t("product.addToCart", { defaultValue: "Add to cart" })}
          >
            {t("product.addToCart", { defaultValue: "Add to cart" })}
          </button>
        )}

        {accessory ? <span className="footer-accessory">{accessory}</span> : null}
      </div>
    </div>
  );
};

export default ProductCard;
