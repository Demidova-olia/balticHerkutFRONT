import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./Login.module.css";

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success(t("login.toasts.success"));
      navigate("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || t("login.toasts.fail");
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("login.title")}</h1>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="email" className={styles.inputLabel}>
            {t("login.emailLabel")}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className={styles.inputField}
            placeholder={t("login.emailPlaceholder") ?? ""}
          />
        </div>

        <div>
          <label htmlFor="password" className={styles.inputLabel}>
            {t("login.passwordLabel")}
          </label>
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className={styles.inputField}
              placeholder={t("login.passwordPlaceholder") ?? ""}
            />
            <button
              type="button"
              className={styles.togglePwdBtn}
              aria-label={showPassword ? t("login.hidePwd") : t("login.showPwd")}
              title={showPassword ? t("login.hidePwd") : t("login.showPwd")}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? t("login.hide") : t("login.show")}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? t("login.loading") : t("login.submit")}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/register" className={styles.registerLink}>
          {t("login.registerLink")}
        </Link>
      </div>
      <Link to="/home" className={styles.returnLink}>
        {t("login.returnHome")}
      </Link>
    </div>
  );
}

export default Login;
