import { useState, useEffect } from "react";
import styles from "./AdminCategories.module.css";
import { Category } from "../../../types/category";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/CategoryService";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import BottomNav from "../../../components/Admin/BottomNav";


const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log("fetchCategories error:", e);
        setError("Error fetching categories");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasDuplicate = (name: string) => {
    const val = name.trim().toLowerCase();
    return categories.some((c) => c.name.trim().toLowerCase() === val);
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    if (hasDuplicate(name)) {
      setError("Category with this name already exists");
      return;
    }

    try {
      setAddingCategory(true);
      setError(null);
      const added = await createCategory({ name });
      setCategories((prev) => [...prev, added]);
      setNewCategory("");
    } catch (e) {
      console.log("handleAddCategory error:", e);
      setError("Error adding category");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      console.log("handleDeleteCategory error:", e);
      setError("Error deleting category");
    }
  };

  const handleEditCategory = async (id: string, currentName: string) => {
    const next = prompt("Enter a new category name:", currentName)?.trim();
    if (!next || next === currentName) return;
    if (hasDuplicate(next)) {
      setError("Category with this name already exists");
      return;
    }

    try {
      const updated = await updateCategory(id, { name: next });
      setCategories((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (e) {
      console.log("handleEditCategory error:", e);
      setError("Error editing category");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) {
    // показываем ошибку, но оставляем интерфейс доступным
    // чтобы пользователь мог попробовать снова
  }

  return (
    <div className={styles.adminCategories}>
      <h2 className={styles.heading}>Manage Categories</h2>
      <AdminNavBar />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCategory();
          }}
          placeholder="New category"
          className={styles.inputField}
        />
        <button
          onClick={handleAddCategory}
          disabled={addingCategory}
          className={`${styles.button} ${styles.addButton}`}
        >
          {addingCategory ? "Adding..." : "Add Category"}
        </button>
      </div>

      <ul className={styles.categoryList}>
        {categories
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((category) => (
            <li key={category._id} className={styles.categoryItem}>
              <div className={styles.categoryContent}>
                {category.name}{" "}
                <span className={styles.categoryId}>({category._id})</span>
              </div>
              <div className={styles.categoryActions}>
                <button
                  onClick={() => handleEditCategory(category._id, category.name)}
                  className={`${styles.button} ${styles.editButton}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className={`${styles.button} ${styles.deleteButton}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>

      <BottomNav />
    </div>
  );
};

export default AdminCategories;

