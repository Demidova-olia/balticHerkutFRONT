// src/pages/profile/EditProfilePage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { User } from "../../types/user";
import UserService from "../../services/UserService";
import styles from "./EditProfilePage.module.css";

const EditProfilePage: React.FC = () => {
  const [user, setUser] = useState<Partial<User>>({});
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");

  // Заголовок страницы
  useEffect(() => {
    document.title = `${t("profile.editPage.title", "Edit Profile")} — Baltic Herkut`;
  }, [t, i18n.language]);

  // Загрузка данных профиля с возможностью отмены
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const data = await UserService.getProfile(ac.signal);
        setUser(data);
        setError("");
      } catch (e: any) {
        if (axios.isAxiosError(e) && e.code === "ERR_CANCELED") return;
        setError(t("profile.editPage.messages.loadFail", "Failed to load profile data"));
      }
    })();

    return () => ac.abort();
  }, [t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof NonNullable<User["address"]>;
      setUser((prev) => ({
        ...prev,
        address: {
          ...(prev.address ?? {}),
          [key]: value,
        } as User["address"],
      }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value } as Partial<User>));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ac = new AbortController();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await UserService.updateProfile(user, ac.signal);
      setSuccess(t("profile.editPage.messages.success", "Profile updated successfully."));
      // Небольшая пауза для UX, затем возврат в профиль
      setTimeout(() => navigate("/profile"), 1200);
    } catch (e: any) {
      if (axios.isAxiosError(e) && e.code === "ERR_CANCELED") return;
      setError(t("profile.editPage.messages.fail", "Failed to update profile."));
    } finally {
      setSubmitting(false);
      // при необходимости можно ac.abort() здесь
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("profile.editPage.title", "Edit Profile")}</h1>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <form onSubmit={handleSubmit} className={styles.form} aria-busy={submitting}>
        {/* Username / Email (только чтение) */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">
            {t("profile.editPage.labels.username", "Username")}
          </label>
          <input
            id="username"
            name="username"
            className={styles.input}
            value={user.username || ""}
            onChange={handleChange}
            placeholder={t("profile.editPage.placeholders.username", "Username")}
            disabled
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            {t("profile.editPage.labels.email", "Email")}
          </label>
          <input
            id="email"
            name="email"
            className={styles.input}
            value={user.email || ""}
            onChange={handleChange}
            placeholder={t("profile.editPage.placeholders.email", "Email")}
            disabled
          />
        </div>

        {/* Телефон */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="phoneNumber">
            {t("profile.editPage.labels.phone", "Phone Number")}
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            className={styles.input}
            value={user.phoneNumber || ""}
            onChange={handleChange}
            placeholder={t("profile.editPage.placeholders.phone", "Phone Number")}
          />
        </div>

        {/* Адрес — две колонки на широких экранах */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="address.street">
              {t("profile.editPage.labels.street", "Street")}
            </label>
            <input
              id="address.street"
              name="address.street"
              className={styles.input}
              value={user.address?.street || ""}
              onChange={handleChange}
              placeholder={t("profile.editPage.placeholders.street", "Street")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="address.city">
              {t("profile.editPage.labels.city", "City")}
            </label>
            <input
              id="address.city"
              name="address.city"
              className={styles.input}
              value={user.address?.city || ""}
              onChange={handleChange}
              placeholder={t("profile.editPage.placeholders.city", "City")}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="address.postalCode">
              {t("profile.editPage.labels.postalCode", "Postal Code")}
            </label>
            <input
              id="address.postalCode"
              name="address.postalCode"
              className={styles.input}
              value={user.address?.postalCode || ""}
              onChange={handleChange}
              placeholder={t("profile.editPage.placeholders.postalCode", "Postal Code")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="address.country">
              {t("profile.editPage.labels.country", "Country")}
            </label>
            <input
              id="address.country"
              name="address.country"
              className={styles.input}
              value={user.address?.country || ""}
              onChange={handleChange}
              placeholder={t("profile.editPage.placeholders.country", "Country")}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => navigate("/profile")}
            disabled={submitting}
          >
            {t("profile.editPage.buttons.back", "Back to Profile")}
          </button>

          <button type="submit" className={styles.primaryBtn} disabled={submitting}>
            {submitting
              ? t("profile.editPage.buttons.saving", "Saving...")
              : t("profile.editPage.buttons.save", "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
