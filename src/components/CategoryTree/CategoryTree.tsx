// src/components/CategoryTree/CategoryTree.tsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoryWithSubcategories } from "../../types/category";
import styles from "./CategoryTree.module.css";

interface Props {
  categories: CategoryWithSubcategories[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  onCategoryToggle: (categoryId: string) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
}

type LocalizedField = {
  ru?: string;
  en?: string;
  fi?: string;
  _source?: string;
};

function pickLocalizedName(value: unknown, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  const v = value as LocalizedField;
  const short = (lang || "en").slice(0, 2) as keyof LocalizedField;

  return (
    (v[short] as string | undefined)?.trim() ||
    (v._source ? (v[v._source as keyof LocalizedField] as string | undefined) : "")?.trim() ||
    (v.en || "").trim() ||
    (v.ru || "").trim() ||
    (v.fi || "").trim() ||
    ""
  );
}

const CategoryTree: React.FC<Props> = ({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  onCategoryToggle,
  onSubcategorySelect,
}) => {
  const { i18n, t } = useTranslation("common");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  const normalized = useMemo(
    () =>
      (categories || []).map((c) => {
        const catNameSource: any = (c as any).name_i18n ?? (c as any).name;
        return {
          ...c,
          _name: pickLocalizedName(catNameSource, lang) || "—",
          _subcategories: (c.subcategories || []).map((s: any) => {
            const subNameSource: any = s?.name_i18n ?? s?.name;
            return {
              ...s,
              _name: pickLocalizedName(subNameSource, lang) || "—",
            };
          }),
        };
      }),
    [categories, lang]
  );

  const handleCategoryEnter = (categoryId: string) => setHoveredCategory(categoryId);
  const handleCategoryLeave = () => setHoveredCategory(null);
  const handleSubcategoryEnter = (categoryId: string) => setHoveredCategory(categoryId);
  const handleSubcategoryLeave = () => setHoveredCategory(null);

  if (!hasCategories) {
    return (
      <div className={styles.empty}>
        {t("categories.empty", { defaultValue: "No categories yet." })}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.categoriesRow}>
        {normalized.map((category) => {
          const isOpen =
            selectedCategoryId === category._id || hoveredCategory === category._id;
          const dropdownId = `subcats-${category._id}`;

          return (
            <div key={category._id} className={styles.categoryBlock}>
              <button
                type="button"
                onClick={() => onCategoryToggle(category._id)}
                onMouseEnter={() => handleCategoryEnter(category._id)}
                onMouseLeave={handleCategoryLeave}
                className={`${styles.categoryButton} ${
                  selectedCategoryId === category._id ? styles.activeCategory : ""
                }`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={dropdownId}
              >
                {category._name}
              </button>

              {isOpen && (
                <ul
                  id={dropdownId}
                  className={styles.subcategoryDropdown}
                  role="listbox"
                  onMouseEnter={() => handleSubcategoryEnter(category._id)}
                  onMouseLeave={handleSubcategoryLeave}
                >
                  {(category._subcategories || []).length > 0 ? (
                    category._subcategories.map((subcat) => (
                      <li
                        key={subcat._id}
                        role="option"
                        aria-selected={selectedSubcategoryId === subcat._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSubcategorySelect(subcat._id);
                        }}
                        className={`${styles.subcategoryItem} ${
                          selectedSubcategoryId === subcat._id ? styles.activeSubcategory : ""
                        }`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSubcategorySelect(subcat._id);
                          }
                        }}
                      >
                        {subcat._name}
                      </li>
                    ))
                  ) : (
                    <li className={styles.subcategoryEmpty}>
                      {t("categories.noSubcategories", {
                        defaultValue: "No subcategories",
                      })}
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTree;
