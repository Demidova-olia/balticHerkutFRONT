// src/pages/register/Register.tsx
import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../utils/axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./Register.module.css";

function Register() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `${t("register.title", "Register")} — Baltic Herkut`;
  }, [t, i18n.language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Жёстче ограничим телефон (только цифры)
    if (name === "phoneNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10); // максимум 10 цифр
      setFormData((prev) => ({ ...prev, phoneNumber: digits }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // убираем лишние пробелы
    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      username: formData.username.trim(),
      phoneNumber: formData.phoneNumber.trim(),
    };

    if (
      !payload.email ||
      !payload.password ||
      !payload.confirmPassword ||
      !payload.username ||
      !payload.phoneNumber
    ) {
      toast.error(t("register.errors.required", "All fields are required"));
      return;
    }

    // username: как на бэке — минимум 3, только латиница/цифры
    if (!/^[a-zA-Z0-9]{3,}$/.test(payload.username)) {
      toast.error(t("register.errors.username", "Username must be at least 3 characters, Latin letters and digits only"));
      return;
    }

    // телефон: как на бэке — ровно 10 цифр
    if (!/^\d{10}$/.test(payload.phoneNumber)) {
      toast.error(t("register.errors.phone", "Phone must contain exactly 10 digits"));
      return;
    }

    if (payload.password !== payload.confirmPassword) {
      toast.error(t("register.errors.mismatch", "Passwords do not match"));
      return;
    }

    try {
      setIsLoading(true);

      await axiosInstance.post("/users/register", {
        email: payload.email,
        password: payload.password,
        username: payload.username,
        phoneNumber: payload.phoneNumber,
      });

      toast.success(
        t("register.toasts.success", "Registration successful! You can now log in.")
      );
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message ||
            t("register.toasts.fail", "Registration error")
        );
      } else {
        toast.error(t("register.toasts.fail", "Registration error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{t("register.title", "Register")}</h1>

      <form onSubmit={handleSubmit} className={styles.formWrapper} noValidate>
        <div>
          <label htmlFor="username" className={styles.label}>
            {t("register.labels.username", "Username:")}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
            pattern="[A-Za-z0-9]{3,}"
            className={styles.inputField}
            placeholder={t("register.placeholders.username", "Enter your username")}
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="email" className={styles.label}>
            {t("register.labels.email", "Email:")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.inputField}
            placeholder={t("register.placeholders.email", "Enter your email")}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className={styles.label}>
            {t("register.labels.phone", "Phone Number:")}
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            inputMode="numeric"
            pattern="\d{10}"
            minLength={10}
            maxLength={10}
            className={styles.inputField}
            placeholder={t("register.placeholders.phone", "Enter your phone number")}
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="password" className={styles.label}>
            {t("register.labels.password", "Password:")}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className={styles.inputField}
            placeholder={t("register.placeholders.password", "Enter your password")}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={styles.label}>
            {t("register.labels.confirmPassword", "Confirm Password:")}
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            className={styles.inputField}
            placeholder={t("register.placeholders.confirmPassword", "Repeat your password")}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading
            ? t("register.buttons.loading", "Registering...")
            : t("register.buttons.submit", "Register")}
        </button>
      </form>

      <p className={styles.footerText}>
        {t("register.haveAccount", "Already have an account?")}{" "}
        <Link to="/login">{t("register.loginLink", "Log in")}</Link>
      </p>

      <div className={styles.returnLinkWrapper}>
        <Link to="/home" className={styles.returnLink}>
          {t("register.returnHome", "Return to Home Page")}
        </Link>
      </div>
    </div>
  );
}

export default Register;
