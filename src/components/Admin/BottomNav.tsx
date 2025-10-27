// src/components/Admin/BottomNav.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./BottomNav.module.css";
import { useTranslation } from "react-i18next";

type BottomNavProps = {
  backLabel?: string;
  mainMenuLabel?: string;
  mainMenuTo?: string;
  showBack?: boolean;
  showMainMenu?: boolean;
  className?: string;
};

const BottomNav: React.FC<BottomNavProps> = ({
  backLabel,
  mainMenuLabel,
  mainMenuTo = "/",
  showBack = true,
  showMainMenu = true,
  className = "",
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const backText = backLabel ?? t("common.goBack", { defaultValue: "Go Back" });
  const mainText =
    mainMenuLabel ?? t("common.goHome", { defaultValue: "Go to Main Menu" });

  return (
    <div className={`${styles.bottomNav} ${className}`.trim()}>
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`${styles.button} ${styles.backBtn}`}
        >
          {backText}
        </button>
      )}

      {showMainMenu && (
        <Link to={mainMenuTo} className={`${styles.button} ${styles.mainMenuBtn}`}>
          {mainText}
        </Link>
      )}
    </div>
  );
};

export default BottomNav;
