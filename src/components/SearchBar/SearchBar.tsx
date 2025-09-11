// src/components/SearchBar/SearchBar.tsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SearchBar.module.css";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** через сколько мс вызывать onDebouncedChange после остановки ввода */
  debounceMs?: number;
  /** колбэк, который вызывается с debounce */
  onDebouncedChange?: (value: string) => void;

  /** показывать индикатор загрузки */
  isLoading?: boolean;
}

const SearchBar: React.FC<Props> = ({
  value,
  onChange,
  debounceMs = 0,
  onDebouncedChange,
  isLoading = false,
}) => {
  const { t } = useTranslation("common");

  useEffect(() => {
    if (!onDebouncedChange || !debounceMs) return;
    const id = setTimeout(() => onDebouncedChange(value), debounceMs);
    return () => clearTimeout(id);
  }, [value, debounceMs, onDebouncedChange]);

  const placeholder = t("search.placeholder", "Search products...");
  const ariaLabel = t("search.ariaLabel", "Search products");

  return (
    <div className={styles.searchFilters}>
      <div className={styles.inputWrap}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles.searchInput}
          aria-label={ariaLabel}
        />
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      </div>
    </div>
  );
};

export default SearchBar;


