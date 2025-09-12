// src/pages/admin/categories/AdminCategories.tsx
import { useState, useEffect, useMemo } from "react";
import styles from "./AdminCategories.module.css";
import { Category, LocalizedField } from "../../../types/category";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/CategoryService";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import BottomNav from "../../../components/Admin/BottomNav";
import { useTranslation } from "react-i18next";

function pickLocalizedName(value: Category["name"], lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();

  const v = value as LocalizedField;
  const short = (lang || "en").slice(0, 2) as "en" | "ru" | "fi";

  return (
    (v[short] && String(v[short]).trim()) ||
    (v._source && v[v._source] && String(v[v._source]!).trim()) ||
    (v.en && String(v.en).trim()) ||
    (v.ru && String(v.ru).trim()) ||
    (v.fi && String(v.fi).trim()) ||
    ""
  );
}

const AdminCategories: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  const lang = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const view = useMemo(
    () =>
      (categories || []).map((c) => ({
        ...c,
        _name: pickLocalizedName(c.name, lang),
      })),
    [categories, lang]
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log("fetchCategories error:", e);
        setError(t("admin.categories.errors.fetch", { defaultValue: "Error fetching categories" }));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const hasDuplicate = (name: string) => {
    const val = name.trim().toLowerCase();
    return view.some((c) => c._name.trim().toLowerCase() === val);
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    if (hasDuplicate(name)) {
      setError(t("admin.categories.errors.duplicate", { defaultValue: "Category with this name already exists" }));
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
      setError(t("admin.categories.errors.add", { defaultValue: "Error adding category" }));
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t("admin.categories.confirmDelete", { defaultValue: "Are you sure you want to delete this category?" })))
      return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      console.log("handleDeleteCategory error:", e);
      setError(t("admin.categories.errors.delete", { defaultValue: "Error deleting category" }));
    }
  };

  const handleEditCategory = async (id: string, current: string) => {
    const next = prompt(
      t("admin.categories.promptEdit", { defaultValue: "Enter a new category name:" }),
      current
    )?.trim();
    if (!next || next === current) return;
    if (hasDuplicate(next)) {
      setError(t("admin.categories.errors.duplicate", { defaultValue: "Category with this name already exists" }));
      return;
    }

    try {
      const updated = await updateCategory(id, { name: next });
      setCategories((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (e) {
      console.log("handleEditCategory error:", e);
      setError(t("admin.categories.errors.edit", { defaultValue: "Error editing category" }));
    }
  };

  if (loading) return <div>{t("loading.default", { defaultValue: "Loading..." })}</div>;

  return (
    <div className={styles.page}>
    <div className={styles.adminCategories}>
      <h2 className={styles.heading}>{t("admin.categories.title", { defaultValue: "Manage Categories" })}</h2>
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
          placeholder={t("admin.categories.newPlaceholder", { defaultValue: "New category" })}
          className={styles.inputField}
        />
        <button
          onClick={handleAddCategory}
          disabled={addingCategory}
          className={`${styles.button} ${styles.addButton}`}
        >
          {addingCategory
            ? t("admin.categories.buttons.adding", { defaultValue: "Adding..." })
            : t("admin.categories.buttons.add", { defaultValue: "Add Category" })}
        </button>
      </div>

      <ul className={styles.categoryList}>
        {view
          .slice()
          .sort((a, b) =>
            a._name.localeCompare(b._name, undefined, { sensitivity: "base" })
          )
          .map((category) => (
            <li key={category._id} className={styles.categoryItem}>
              <div className={styles.categoryContent}>
                {category._name || "—"}{" "}
                <span className={styles.categoryId}>({category._id})</span>
              </div>
              <div className={styles.categoryActions}>
                <button
                  onClick={() => handleEditCategory(category._id, category._name)}
                  className={`${styles.button} ${styles.editButton}`}
                >
                  {t("admin.categories.buttons.edit", { defaultValue: "Edit" })}
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className={`${styles.button} ${styles.deleteButton}`}
                >
                  {t("admin.categories.buttons.delete", { defaultValue: "Delete" })}
                </button>
              </div>
            </li>
          ))}
      </ul>

      <BottomNav />
    </div>
    </div>
  );
};

export default AdminCategories;


