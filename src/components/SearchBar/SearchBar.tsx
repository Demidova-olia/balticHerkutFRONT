import React from "react";
import styles from "./SearchBar.module.css";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className={styles.searchFilters}>
      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={onChange}
        className={styles.searchInput}
      />
    </div>
  );
};

export default SearchBar;

