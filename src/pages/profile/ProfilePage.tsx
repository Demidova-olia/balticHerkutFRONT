import React, { useEffect, useState } from "react";
import UserService from "../../services/UserService";
import { User } from "../../types/user";
import { IOrder } from "../../types/order";
import NavBar from "../../components/NavBar/NavBar";
import FavoriteList from "../../components/Favorite/FavoriteList";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);

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

    fetchProfile();
  }, []);

  return (
    <div className="profilePage">
      <NavBar />
      <h1 className="pageTitle">Profile Page</h1>

      {user ? (
        <div className="userInfo">
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="profileImage"
            />
          )}
          <h2 className="username">{user.username}</h2>
          <p className="userDetail">Email: {user.email}</p>
          <p className="userDetail">Phone: {user.phoneNumber}</p>
          <p className="userDetail">
            Address: {user.address?.street}, {user.address?.city},{" "}
            {user.address?.postalCode}, {user.address?.country}
          </p>
          <p className="userDetail">
            Joined: {new Date(user.createdAt || "").toLocaleDateString()}
          </p>

          <h3 className="sectionTitle">Your Orders:</h3>
          <ul className="orderList">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <li key={index} className="orderItem">
                  {JSON.stringify(order)}
                </li>
              ))
            ) : (
              <li className="orderItem">No orders yet.</li>
            )}
          </ul>

          {/* Передаем userId в компонент FavoriteList */}
          <FavoriteList/>
        </div>
      ) : (
        <p className="loadingText">Loading profile...</p>
      )}
    </div>
  );
};

export default ProfilePage;
