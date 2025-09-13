import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./Login.module.css";

function Login() {
  // используем общий неймспейс, где лежат строки
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
      toast.success(t("login.toasts.success", "Вы успешно вошли"));
      navigate("/");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg = apiErr.response?.data?.message || t("login.toasts.fail", "Ошибка входа");
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("login.title", "Вход")}</h1>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          {/* визуально прячем, но оставляем для доступности */}
          <label htmlFor="email" className={styles.srOnly}>
            {t("login.emailLabel", "E-mail")}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className={styles.inputField}
            placeholder={t("login.emailPlaceholder", "Введите e-mail")}
            aria-label={t("login.emailLabel", "E-mail")}
          />
        </div>

        <div>
          <label htmlFor="password" className={styles.srOnly}>
            {t("login.passwordLabel", "Пароль")}
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
              placeholder={t("login.passwordPlaceholder", "Введите пароль")}
              aria-label={t("login.passwordLabel", "Пароль")}
            />
            <button
              type="button"
              className={styles.togglePwdBtn}
              aria-label={
                showPassword
                  ? t("login.hidePwd", "Скрыть пароль")
                  : t("login.showPwd", "Показать пароль")
              }
              title={
                showPassword
                  ? t("login.hidePwd", "Скрыть пароль")
                  : t("login.showPwd", "Показать пароль")
              }
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? t("login.hide", "Скрыть") : t("login.show", "Показать")}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? t("login.loading", "Входим…") : t("login.submit", "Войти")}
        </button>
      </form>

      <div className={styles.links}>
        <Link to="/register" className={styles.registerLink}>
          {t("login.registerLink", "Создать аккаунт")}
        </Link>
        <Link to="/home" className={styles.returnLink}>
          {t("login.returnHome", "На главную")}
        </Link>
      </div>
    </div>
  );
}

export default Login;
