import { useEffect, useState } from 'react';
import FavoriteService from '../../services/FavoriteService';
import { Product } from '../../types/product';
import { FaHeart } from 'react-icons/fa';
import styles from './FavoriteIcon.module.css';

const FavoriteIcon = ({ productId }: { productId: string }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favoritesData = await FavoriteService.getFavorites();
        setFavorites(favoritesData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);

    try {
      const isAlreadyFavorite = favorites.some((fav) => fav._id === productId);

      if (isAlreadyFavorite) {
        await FavoriteService.removeFromFavorites(productId);
        setFavorites((prev) => prev.filter((fav) => fav._id !== productId));
      } else {
        const addedProduct = await FavoriteService.addToFavorites(productId);
        setFavorites((prev) => [...prev, addedProduct]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const isFavorite = favorites.some((fav) => fav._id === productId);

  const iconClass = `
    ${styles.icon}
    ${isFavorite ? styles.favorite : styles.notFavorite}
    ${isPulsing ? styles.pulse : ''}
  `.trim();

  return (
    <div>
      <FaHeart
        onClick={handleToggleFavorite}
        className={iconClass}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FavoriteIcon;

