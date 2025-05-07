import React, { useEffect, useState } from "react";
import { Subcategory, SubcategoryPayload } from "../../../types/subcategory";
import { Category } from "../../../types/category";
import { getCategories } from "../../../services/CategoryService";
import { Link, useNavigate } from "react-router-dom";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  updateSubcategory,
} from "../../../services/SubcategoryService";
import styles from "./AdminSubcategories.module.css";

const AdminSubcategories: React.FC = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subs, cats] = await Promise.all([
        getSubcategories(),
        getCategories(),
      ]);
      setSubcategories(subs);
      setCategories(cats);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!newName.trim() || !selectedParent) return;

    const payload: SubcategoryPayload = {
      name: newName,
      parent: selectedParent,
    };

    try {
      if (editingId) {
        await updateSubcategory(editingId, payload);
      } else {
        await createSubcategory(payload);
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Create/Update failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubcategory(id);
      fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = (sub: Subcategory) => {
    setNewName(sub.name);
    setSelectedParent(
      typeof sub.parent === "string" ? sub.parent : sub.parent._id
    );
    setEditingId(sub._id);
  };

  const resetForm = () => {
    setNewName("");
    setSelectedParent("");
    setEditingId(null);
  };

  return (
    <div className={styles.adminSubcategories}>
  <div className={styles.container}>
    <h2 className={styles.heading}>Admin: Subcategories</h2>
    <AdminNavBar />

    <div className={styles.form}>
      <input
        type="text"
        placeholder="Subcategory name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className={styles.input}
      />
      <select
        value={selectedParent}
        onChange={(e) => setSelectedParent(e.target.value)}
        className={styles.select}
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>
      <button onClick={handleCreateOrUpdate} className={styles.button}>
        {editingId ? "Update" : "Create"}
      </button>
      {editingId && (
        <button onClick={resetForm} className={`${styles.button} ${styles.cancelButton}`}>
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
          {subcategories.map((sub) => (
            <tr key={sub._id}>
              <td>{sub.name}</td>
              <td>
                {typeof sub.parent === "string"
                  ? sub.parent
                  : sub.parent?.name || "Unknown"}
              </td>
              <td>
                <button onClick={() => handleEdit(sub)} className={`${styles.button} ${styles.editBtn}`}>
                  Edit
                </button>
                <button onClick={() => handleDelete(sub._id)} className={`${styles.button} ${styles.deleteBtn}`}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className={styles.backButtons}>
      <button onClick={() => navigate(-1)} className={`${styles.button} ${styles.backBtn}`}>
        Go Back
      </button>

      <Link to={`/`} className={`${styles.button} ${styles.mainMenuBtn}`}>
        Return to Main Menu
      </Link>
    </div>
  </div>
</div>
  );
};

export default AdminSubcategories;
