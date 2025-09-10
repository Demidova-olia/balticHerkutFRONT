import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../utils/axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./Register.module.css";

function Register() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = t("register.title");
  }, [t, i18n.language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.username ||
      !formData.phoneNumber
    ) {
      toast.error(t("register.errors.required"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t("register.errors.mismatch"));
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosInstance.post("/users/register", {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
      });


      toast.success(t("register.toasts.success"));
      navigate("/login");
    } catch (error) {
      // console.error("Registration error:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(axiosError.response?.data?.message || t("register.toasts.fail"));
      } else {
        toast.error(t("register.toasts.fail"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{t("register.title")}</h1>

      <form onSubmit={handleSubmit} className={styles.formWrapper}>
        <div>
          <label htmlFor="username" className={styles.label}>
            {t("register.labels.username")}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className={styles.inputField}
            placeholder={t("register.placeholders.username")}
          />
        </div>

        <div>
          <label htmlFor="email" className={styles.label}>
            {t("register.labels.email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.inputField}
            placeholder={t("register.placeholders.email")}
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className={styles.label}>
            {t("register.labels.phone")}
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className={styles.inputField}
            placeholder={t("register.placeholders.phone")}
          />
        </div>

        <div>
          <label htmlFor="password" className={styles.label}>
            {t("register.labels.password")}
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
            placeholder={t("register.placeholders.password")}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={styles.label}>
            {t("register.labels.confirmPassword")}
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
            placeholder={t("register.placeholders.confirmPassword")}
          />
        </div>

        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? t("register.buttons.loading") : t("register.buttons.submit")}
        </button>
      </form>

      <p className={styles.footerText}>
        {t("register.haveAccount")}{" "}
        <Link to="/login">{t("register.loginLink")}</Link>
      </p>

      <div className={styles.returnLinkWrapper}>
        <Link to="/home" className={styles.returnLink}>
          {t("register.returnHome")}
        </Link>
      </div>
    </div>
  );
}

export default Register;
