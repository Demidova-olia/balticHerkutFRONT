import React, { useEffect, useState } from "react";
import UserService from "../../services/UserService";
import FavoriteService from "../../services/FavoriteService";
import { User } from "../../types/user";
import { FavoriteProduct, Favorite } from "../../types/favorite"; // Импортируем правильный тип
import { IOrder } from "../../types/order";
import { Product } from "../../types/product"; // Подключаем тип Product, если еще не сделано

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);

  // Загружаем данные профиля, заказов и избранных продуктов
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await UserService.getProfile();
        setUser(userData);
        setOrders(userData.orders || []);
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };

    const fetchFavorites = async () => {
      try {
        const favoritesRaw = await FavoriteService.getFavorites();
        const favoriteProducts: FavoriteProduct[] = favoritesRaw.map((fav) => {
          // Преобразуем только в случае если product действительно является объектом типа Product
          const product = fav.product as Product; // Приводим тип к Product
          return {
            _id: fav._id,
            name: product.name,
            price: product.price,
            images: product.images,
          };
        });
        setFavorites(favoriteProducts);
      } catch (error) {
        console.error("Error fetching favorites", error);
      }
    };

    fetchProfile();
    fetchFavorites();
  }, []);

  const handleFavoriteClick = async (productId: string) => {
    try {
      if (favorites.find((fav) => fav._id === productId)) {
        await FavoriteService.removeFromFavorites(productId);
        setFavorites((prev) => prev.filter((fav) => fav._id !== productId));
      } else {
        await FavoriteService.addToFavorites(productId);
        // Загружаем и преобразуем избранное заново
        const updatedFavorites: Favorite[] = await FavoriteService.getFavorites();
        const favoriteProducts: FavoriteProduct[] = updatedFavorites.map((fav) => {
          const product = fav.product as Product; // Приводим тип к Product
          return {
            _id: fav._id,
            name: product.name,
            price: product.price,
            images: product.images,
          };
        });
        setFavorites(favoriteProducts);
      }
    } catch (error) {
      console.error("Error updating favorites", error);
    }
  };

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>

      {user ? (
        <div className="user-info">
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt="Profile"
              style={{ width: 100, height: 100, borderRadius: "50%" }}
            />
          )}
          <h2>{user.username}</h2>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phoneNumber}</p>
          <p>
            Address: {user.address?.street}, {user.address?.city}, {user.address?.postalCode},{" "}
            {user.address?.country}
          </p>
          <p>Joined: {new Date(user.createdAt || "").toLocaleDateString()}</p>

          <h3>Your Orders:</h3>
          <ul>
            {orders.length > 0 ? (
              orders.map((order, index) => <li key={index}>{JSON.stringify(order)}</li>)
            ) : (
              <li>No orders yet.</li>
            )}
          </ul>

          <h3>Your Favorite Products:</h3>
          <ul>
            {favorites.map((product) => (
              <li key={product._id}>
                <p>{product.name} — ${product.price}</p>
                {product.images[0] && <img src={product.images[0]} alt={product.name} width={80} />}
                <button onClick={() => handleFavoriteClick(product._id)}>
                  Remove from Favorites
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default ProfilePage;
