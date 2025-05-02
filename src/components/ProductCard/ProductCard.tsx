import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import "./ProductCard.scss";
import { Product } from "../../types/product";


type ProductCardProps = {
    product: Product
    onAddToCart?: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const { _id, name, price, images } = product;
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState<number>(1);

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart();
        } else {
            addToCart({
                id: product._id,
                name,
                price,
                quantity,
                image: images[0] || '/images/no-image.png'
            });
        }
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newQuantity = parseInt(e.target.value);
        setQuantity(newQuantity);
    };

    const imageUrl = images && images.length > 0 ? images[0] : '/images/no-image.png';

    return (
        <div className="product-card">
            <Link to={`/product/${_id}`}>
                <img 
                    className="product-image" 
                    src={imageUrl} 
                    alt={name}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/no-image.png';
                    }}
                />
                <h4>{name}</h4>
                <p>{price.toFixed(2)} €</p>
            </Link>
            <div className="quantity-selector">
                <label htmlFor={`quantity-${_id}`}>Quantity:</label>
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
            <button 
                className="add-to-cart"
                onClick={handleAddToCart}
            >
                Add to cart
            </button>
        </div>
    );
};

export default ProductCard;
