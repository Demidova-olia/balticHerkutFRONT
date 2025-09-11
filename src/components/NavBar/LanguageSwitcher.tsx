import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

type Lang = "en" | "ru" | "fi";

const languages: Array<{ code: Lang; label: string; title: string }> = [
  { code: "en", label: "EN", title: "English" },
  { code: "ru", label: "RU", title: "Русский" },
  { code: "fi", label: "FI", title: "Suomi" },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || "en").slice(0, 2) as Lang;

  const setLang = (lng: Lang) => {
    if (lng === current) return;
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    localStorage.setItem("i18nextLng", lng);
  };

  useEffect(() => {
    document.documentElement.lang = current;
  }, [current]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const idx = languages.findIndex((l) => l.code === current);
    const next =
      e.key === "ArrowRight"
        ? languages[(idx + 1) % languages.length]
        : languages[(idx - 1 + languages.length) % languages.length];
    setLang(next.code);
  };

  return (
    <div
      className={styles.segment}
      role="group"
      aria-label={t("nav.language", { defaultValue: "Language" })}
      onKeyDown={onKeyDown}
    >
      {languages.map(({ code, label, title }) => (
        <button
          key={code}
          type="button"
          className={styles.btn}
          data-active={current === code}
          aria-pressed={current === code}
          title={title}
          onClick={() => setLang(code)}
        >
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </div>
  );
}
