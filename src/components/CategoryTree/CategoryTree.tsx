import { CategoryWithSubcategories } from "../../types/category";

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
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="flex space-x-4 overflow-x-auto">
        {categories.map((category) => (
          <div key={category._id} className="min-w-[150px]">
            <button
              onClick={() => onCategoryToggle(category._id)}
              className={`block w-full py-2 px-4 border rounded-lg text-left ${
                selectedCategoryId === category._id ? "bg-blue-200" : "bg-gray-200"
              } hover:bg-gray-300`}
            >
              {category.name}
            </button>

            {selectedCategoryId === category._id && (
              <ul className="mt-2 space-y-1">
                {category.subcategories.map((subcat) => (
                  <li
                    key={subcat._id}
                    onClick={() => onSubcategorySelect(subcat._id)}
                    className={`cursor-pointer px-4 py-2 rounded-lg ${
                      selectedSubcategoryId === subcat._id ? "bg-blue-300" : "hover:bg-gray-100"
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



