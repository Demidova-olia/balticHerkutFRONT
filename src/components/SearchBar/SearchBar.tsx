import React, { useEffect } from "react";
import styles from "./SearchBar.module.css";

interface Props {

  value: string;

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<Props> = ({
  value,
  onChange,
  debounceMs = 0,
  onDebouncedChange,
  isLoading = false,
}) => {

  useEffect(() => {
    if (!onDebouncedChange || !debounceMs) return;
    const id = setTimeout(() => onDebouncedChange(value), debounceMs);
    return () => clearTimeout(id);
  }, [value, debounceMs, onDebouncedChange]);

  return (
    <div className={styles.searchFilters}>
      <div className={styles.inputWrap}>
        <input
          type="text"
          placeholder="Search products..."
          value={value}
          onChange={onChange}
          className={styles.searchInput}
          aria-label="Search products"
        />
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      </div>
    </div>
  );
};

export default SearchBar;


