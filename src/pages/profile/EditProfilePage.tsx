import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../types/user";
import UserService from "../../services/UserService";
import styles from "./EditProfilePage.module.css";

const EditProfilePage: React.FC = () => {
  const [user, setUser] = useState<Partial<User>>({});
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await UserService.getProfile();
        setUser(data);
      } catch {
        setError("Failed to load profile data");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setUser((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UserService.updateProfile(user);
      setSuccess("Profile updated successfully.");
      setTimeout(() => navigate("/profile"), 1500);
    } catch {
      setError("Failed to update profile.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Edit Profile</h1>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="username"
          value={user.username || ""}
          onChange={handleChange}
          placeholder="Username"
          disabled
        />
        <input
          name="email"
          value={user.email || ""}
          onChange={handleChange}
          placeholder="Email"
          disabled
        />
        <input
          name="phoneNumber"
          value={user.phoneNumber || ""}
          onChange={handleChange}
          placeholder="Phone Number"
        />
        <input
          name="address.street"
          value={user.address?.street || ""}
          onChange={handleChange}
          placeholder="Street"
        />
        <input
          name="address.city"
          value={user.address?.city || ""}
          onChange={handleChange}
          placeholder="City"
        />
        <input
          name="address.postalCode"
          value={user.address?.postalCode || ""}
          onChange={handleChange}
          placeholder="Postal Code"
        />
        <input
          name="address.country"
          value={user.address?.country || ""}
          onChange={handleChange}
          placeholder="Country"
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfilePage;
