import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./BottomNav.module.css";

type BottomNavProps = {
  backLabel?: string;
  mainMenuLabel?: string;
  mainMenuTo?: string;
  showBack?: boolean;
  showMainMenu?: boolean;
  className?: string;
};

const BottomNav: React.FC<BottomNavProps> = ({
  backLabel = "Go Back",
  mainMenuLabel = "Go to Main Menu",
  mainMenuTo = "/",
  showBack = true,
  showMainMenu = true,
  className = "",
}) => {
  const navigate = useNavigate();

  return (
    <div className={`${styles.bottomNav} ${className}`.trim()}>
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`${styles.button} ${styles.backBtn}`}
        >
          {backLabel}
        </button>
      )}

      {showMainMenu && (
        <Link
          to={mainMenuTo}
          className={`${styles.button} ${styles.mainMenuBtn}`}
        >
          {mainMenuLabel}
        </Link>
      )}
    </div>
  );
};

export default BottomNav;
