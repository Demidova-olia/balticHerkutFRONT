import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./Login.module.css";

function Login() {
  const { t } = useTranslation("common");

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
      toast.success(t("login.toasts.success", "You have successfully signed in"));
      navigate("/");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        t("login.toasts.fail", "Sign-in failed");
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("login.title", "Sign In")}</h1>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="email" className={styles.srOnly}>
            {t("login.emailLabel", "E-mail")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className={styles.inputField}
            placeholder={t("login.emailPlaceholder", "Enter your e-mail")}
            aria-label={t("login.emailLabel", "E-mail")}
          />
        </div>

        <div>
          <label htmlFor="password" className={styles.srOnly}>
            {t("login.passwordLabel", "Password")}
          </label>
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className={styles.inputField}
              placeholder={t("login.passwordPlaceholder", "Enter your password")}
              aria-label={t("login.passwordLabel", "Password")}
            />
            <button
              type="button"
              className={styles.togglePwdBtn}
              aria-label={
                showPassword
                  ? t("login.hidePwd", "Hide password")
                  : t("login.showPwd", "Show password")
              }
              title={
                showPassword
                  ? t("login.hidePwd", "Hide password")
                  : t("login.showPwd", "Show password")
              }
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword
                ? t("login.hide", "Hide")
                : t("login.show", "Show")}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading
            ? t("login.loading", "Signing in…")
            : t("login.submit", "Sign In")}
        </button>
      </form>

      <div className={styles.links}>
        <Link to="/register" className={styles.registerLink}>
          {t("login.registerLink", "Create an account")}
        </Link>
        <Link to="/home" className={styles.returnLink}>
          {t("login.returnHome", "Back to Home")}
        </Link>
      </div>
    </div>
  );
}

export default Login;
