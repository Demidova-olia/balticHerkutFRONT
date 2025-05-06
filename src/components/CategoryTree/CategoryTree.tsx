import React, { useState } from "react";
import { CategoryWithSubcategories } from "../../types/category";
import styles from './CategoryTree.module.css';

interface Props {
  categories: CategoryWithSubcategories[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  onCategoryToggle: (categoryId: string) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
}

const CategoryTree: React.FC<Props> = ({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  onCategoryToggle,
  onSubcategorySelect,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleCategoryEnter = (categoryId: string) => {
    setHoveredCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null); 
  };

  const handleSubcategoryEnter = (categoryId: string) => {
    setHoveredCategory(categoryId);
  };

  const handleSubcategoryLeave = () => {
    setHoveredCategory(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.categoriesRow}>
        {categories.map((category) => (
          <div key={category._id} className={styles.categoryBlock}>
            <button
              onClick={() => onCategoryToggle(category._id)}
              onMouseEnter={() => handleCategoryEnter(category._id)}
              onMouseLeave={handleCategoryLeave}
              className={`${styles.categoryButton} ${
                selectedCategoryId === category._id ? styles.activeCategory : ''
              }`}
            >
              {category.name}
            </button>

            {(selectedCategoryId === category._id || hoveredCategory === category._id) && (
              <ul
                className={styles.subcategoryDropdown}
                onMouseEnter={() => handleSubcategoryEnter(category._id)}
                onMouseLeave={handleSubcategoryLeave}
              >
                {category.subcategories.map((subcat) => (
                  <li
                    key={subcat._id}
                    onClick={() => onSubcategorySelect(subcat._id)}
                    className={`${styles.subcategoryItem} ${
                      selectedSubcategoryId === subcat._id ? styles.activeSubcategory : ''
                    }`}
                  >
                    {subcat.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTree;
