import React, { useEffect, useState } from "react";
import { Subcategory, SubcategoryPayload } from "../../../types/subcategory";
import { Category } from "../../../types/category";
import { getCategories } from "../../../services/CategoryService";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  updateSubcategory,
} from "../../../services/SubcategoryService";
import styles from "./AdminSubcategories.module.css";
import BottomNav from "../../../components/Admin/BottomNav";

const AdminSubcategories: React.FC = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subs, cats] = await Promise.all([getSubcategories(), getCategories()]);
      setSubcategories(Array.isArray(subs) ? subs : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e) {
      console.error("Error loading data:", e);
      setError("Failed to load data");
      setSubcategories([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasDuplicate = (name: string, parentId: string, skipId?: string) => {
    const n = name.trim().toLowerCase();
    const p = parentId.trim();
    return subcategories.some(
      (s) =>
        s._id !== skipId &&
        (typeof s.parent === "string" ? s.parent : s.parent?._id) === p &&
        s.name.trim().toLowerCase() === n
    );
  };

  const resetForm = () => {
    setNewName("");
    setSelectedParent("");
    setEditingId(null);
    setError(null);
  };

  const handleCreateOrUpdate = async () => {
    const name = newName.trim();
    const parent = selectedParent.trim();
    if (!name || !parent) return;

    if (hasDuplicate(name, parent, editingId || undefined)) {
      setError("Subcategory with this name already exists in the selected category");
      return;
    }

    const payload: SubcategoryPayload = { name, parent };

    try {
      setSaving(true);
      setError(null);
      if (editingId) {
        await updateSubcategory(editingId, payload);
      } else {
        await createSubcategory(payload);
      }
      resetForm();
      await fetchData();
    } catch (e) {
      console.error("Create/Update failed:", e);
      setError("Failed to save subcategory");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await deleteSubcategory(id);
      setSubcategories((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
      setError("Failed to delete subcategory");
    }
  };

  const handleEdit = (sub: Subcategory) => {
    setNewName(sub.name);
    setSelectedParent(typeof sub.parent === "string" ? sub.parent : sub.parent?._id || "");
    setEditingId(sub._id);
    setError(null);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.adminSubcategories}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Admin: Subcategories</h2>
        <AdminNavBar />

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.form}>
          <input
            type="text"
            placeholder="Subcategory name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.input}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateOrUpdate();
            }}
          />

          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className={styles.select}
          >
            <option value="">Select category</option>
            {categories
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>

          <button
            onClick={handleCreateOrUpdate}
            className={styles.button}
            disabled={saving || !newName.trim() || !selectedParent}
          >
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className={`${styles.button} ${styles.cancelButton}`}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </div>

        <div className={styles.subcategoryTable}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Parent Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((sub) => (
                  <tr key={sub._id}>
                    <td>{sub.name}</td>
                    <td>
                      {typeof sub.parent === "string"
                        ? categories.find((c) => c._id === sub.parent)?.name || sub.parent
                        : sub.parent?.name || "Unknown"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(sub)}
                        className={`${styles.button} ${styles.editBtn}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className={`${styles.button} ${styles.deleteBtn}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default AdminSubcategories;
