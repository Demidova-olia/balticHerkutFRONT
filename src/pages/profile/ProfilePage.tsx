import React, { useEffect, useState } from "react";
import UserService from "../../services/UserService";
import { User } from "../../types/user";
import NavBar from "../../components/NavBar/NavBar";
import FavoriteList from "../../components/Favorite/FavoriteList";
import MyOrderList from "../../components/Orders/MyOrdersList";
import styles from "./ProfilePage.module.css";
import { useNavigate } from "react-router";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

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
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <>
      <NavBar />
      <div className={styles.profilePage}>
        
        <h1 className={styles.pageTitle}>Profile</h1>
        <button
          className={styles.editButton}
          onClick={() => navigate("/edit-profile")}
        >
          Edit Profile
        </button>

        {user ? (
          <div className={styles.userInfo}>
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt="Profile"
                className={styles.profileImage}
              />
            )}
            <h2 className={styles.username}>{user.username}</h2>
            <p className={styles.userDetail}>Email: {user.email}</p>
            <p className={styles.userDetail}>Phone: {user.phoneNumber}</p>
            <p className={styles.userDetail}>
              Address: {user.address?.street}, {user.address?.city},{" "}
              {user.address?.postalCode}, {user.address?.country}
            </p>
            <p className={styles.userDetail}>
              Joined: {new Date(user.createdAt || "").toLocaleDateString()}
            </p>
            <MyOrderList />
            <FavoriteList />
          </div>
        ) : (
          <p className={styles.loadingText}>Loading profile...</p>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
