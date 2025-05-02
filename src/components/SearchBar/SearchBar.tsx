import React from "react";
// import "./SearchBar.scss";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="search-filters">
      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={onChange}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;
