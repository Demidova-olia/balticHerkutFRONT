import React from "react";
import { useTranslation } from "react-i18next";
import "./Loading.scss";

interface LoadingProps {
  /** Ключ из словаря i18n, например: "loading.default" */
  textKey?: string;
  /** Фолбэк-текст, если ключа нет в словаре */
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  textKey = "loading.default",
  text,
  className = "",
}) => {
  const { t } = useTranslation("common");
  const label = t(textKey, { defaultValue: text ?? "Loading..." });

  return (
    <div
      className={`loading-overlay ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="spinner" aria-hidden="true" />
      <p className="loading-text">{label}</p>
    </div>
  );
};

export default Loading;

