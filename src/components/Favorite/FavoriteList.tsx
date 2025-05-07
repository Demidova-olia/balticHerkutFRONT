import React, { useEffect, useState } from 'react';
import { Favorite } from '../../types/favorite';

interface FavoriteListProps {
  userId: string; // ensure this is the right type of userId
}

const FavoriteList: React.FC<FavoriteListProps> = ({ userId }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`/api/favorites/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        setError('Error fetching favorites. Please try again later.');
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Favorite Products</h2>
      {favorites.length === 0 ? (
        <p>No favorites available.</p>
      ) : (
        <ul>
          {favorites.map((item) => (
            <li key={item._id}>
              {typeof item.user === 'string' ? item.user : item.user.username || 'Unknown User'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoriteList;
