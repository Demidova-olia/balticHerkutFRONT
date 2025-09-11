import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import UserService from "../../services/UserService";
import { User } from "../../types/user";

import NavBar from "../../components/NavBar/NavBar";
import FavoriteList from "../../components/Favorite/FavoriteList";
import MyOrderList from "../../components/Orders/MyOrdersList";

import styles from "./ProfilePage.module.css";

const FALLBACK_AVATAR = "/assets/no-image.svg";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");

  useEffect(() => {
    document.title = `${t("profile.title", "Profile")} — Baltic Herkut`;
  }, [t, i18n.language]);

  useEffect(() => {
    const ac = new AbortController();

    const fetchProfile = async () => {
      try {
        setError("");
        setLoading(true);
        const userData = await UserService.getProfile(ac.signal);
        setUser(userData);
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.code === "ERR_CANCELED") return;
        console.error("Error fetching profile data", err);
        setError(t("profile.errors.fetch", "Error fetching profile data"));
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    };

    fetchProfile();
    return () => ac.abort();
  }, [t]);

  const avatarSrc = useMemo(() => {
    const p = user?.profilePicture?.trim();
    if (!p) return FALLBACK_AVATAR;
    if (
      p === "defaultProfilePic.png" ||
      p === "/defaultProfilePic.png" ||
      p.startsWith("http") === false && p.startsWith("/") === false && !p.startsWith("data:")
    ) {
      return FALLBACK_AVATAR;
    }
    return p;
  }, [user?.profilePicture]);

  if (error) {
    return (
      <>
        <NavBar />
        <p className={styles.error}>{error}</p>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className={styles.profilePage}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{t("profile.title", "Profile")}</h1>
          <div className={styles.actionBar}>
            <button
              className={styles.editButton}
              onClick={() => navigate("/edit-profile")}
            >
              {t("profile.edit", "Edit Profile")}
            </button>
          </div>
        </header>

        {loading ? (
          <p className={styles.loadingText}>{t("profile.loading", "Loading profile...")}</p>
        ) : user ? (
          <div className={styles.userInfo}>
            <img
              src={avatarSrc}
              alt={t("profile.alt.avatar", "Profile picture")}
              className={styles.profileImage}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).onerror = null;
                (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
              }}
            />

            <h2 className={styles.username}>{user.username}</h2>

            <p className={styles.userDetail}>
              <span className={styles.detailLabel}>{t("profile.labels.email", "Email")}:</span>{" "}
              {user.email}
            </p>

            <p className={styles.userDetail}>
              <span className={styles.detailLabel}>{t("profile.labels.phone", "Phone")}:</span>{" "}
              {user.phoneNumber || "—"}
            </p>

            <p className={styles.userDetail}>
              <span className={styles.detailLabel}>{t("profile.labels.address", "Address")}:</span>{" "}
              {[user.address?.street, user.address?.city, user.address?.postalCode, user.address?.country]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>

            <p className={styles.userDetail}>
              <span className={styles.detailLabel}>{t("profile.labels.joined", "Joined")}:</span>{" "}
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </p>

            <div className={styles.sections}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t("profile.sections.orders", "My Orders")}</h3>
                <MyOrderList />
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t("profile.sections.favorites", "Favorites")}</h3>
                <FavoriteList />
              </section>
            </div>
          </div>
        ) : (
          <p className={styles.loadingText}>{t("profile.noData", "No profile data.")}</p>
        )}
      </div>
    </>
  );
};

export default ProfilePage;

