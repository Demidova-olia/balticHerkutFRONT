import React from "react";
import { Category } from "../../types/category";
import { Subcategory } from "../../types/subcategory";

interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

interface Props {
  categories: CategoryWithSubcategories[];
  openCategory: string | null;
  selectedSubcategory: string;
  onCategoryToggle: (id: string) => void;
  onSubcategorySelect: (name: string) => void;
}

const CategoryTree: React.FC<Props> = ({
  categories,
  openCategory,
  selectedSubcategory,
  onCategoryToggle,
  onSubcategorySelect,
}) => {
  return (
    <div className="categories-tree">
      <h2>Категории</h2>
      {categories.map((category) => (
        <div key={category._id} className="category-block">
          <button
            className="category-toggle"
            onClick={() => onCategoryToggle(category._id)}
          >
            {category.name} {openCategory === category._id ? "−" : "+"}
          </button>
          {openCategory === category._id && (
            <ul className="subcategory-list">
              {category.subcategories.map((subcat) => (
                <li
                  key={subcat._id}
                  onClick={() => onSubcategorySelect(subcat.name)}
                  className={`subcategory-item ${
                    selectedSubcategory === subcat.name ? "active" : ""
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
  );
};

export default CategoryTree;
