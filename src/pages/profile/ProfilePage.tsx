import React, { useEffect, useState } from "react";
import UserService from "../../services/UserService";
import { User } from "../../types/user";
import NavBar from "../../components/NavBar/NavBar";
import FavoriteList from "../../components/Favorite/FavoriteList";
// import MyOrderList from "../../components/Orders/MyOrdersList";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await UserService.getProfile();
        setUser(userData);
      } catch (error) {
        setError("Error fetching profile data");
        console.error("Error fetching profile data", error);
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

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
          {/* <MyOrderList/> */}
          <FavoriteList />
        </div>
      ) : (
        <p className="loadingText">Loading profile...</p>
      )}
    </div>
  );
};

export default ProfilePage;
