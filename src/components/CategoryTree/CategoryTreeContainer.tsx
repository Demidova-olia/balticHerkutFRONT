import React, { useEffect, useState } from "react";
import CategoryTree from "./CategoryTree";
import { getCategoriesWithSubcategories } from "../../services/CategoryService";
import { Category } from "../../types/category";
import { Subcategory } from "../../types/subcategory";

interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

const CategoryTreeContainer: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategoriesWithSubcategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleToggle = (id: string) => {
    setOpenCategory(prev => (prev === id ? null : id));
    setSelectedSubcategory(""); // optionally reset subcategory on collapse
  };

  const handleSelectSubcategory = (name: string) => {
    setSelectedSubcategory(name);
    // Здесь можно сделать fetch продуктов по выбранной подкатегории
    console.log("Selected subcategory:", name);
  };

  return (
    <>
      <CategoryTree
        categories={categories}
        openCategory={openCategory}
        selectedSubcategory={selectedSubcategory}
        onCategoryToggle={handleToggle}
        onSubcategorySelect={handleSelectSubcategory}
      />

      {selectedSubcategory && (
        <div className="product-display">
          <h3>Продукты из подкатегории: {selectedSubcategory}</h3>
          {/* здесь можно отрисовать список продуктов */}
        </div>
      )}
    </>
  );
};

export default CategoryTreeContainer;
