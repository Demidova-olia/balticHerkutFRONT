import React, { useEffect, useState } from "react";
import { Subcategory, SubcategoryPayload } from "../../../types/subcategory";
import { Category } from "../../../types/category";
import SubcategoryService from "../../../services/SubcategoryService";
import { getCategories } from "../../../services/CategoryService";
import { Link, useNavigate } from "react-router-dom";
import {AdminNavBar} from "../../../components/Admin/AdminNavBar";

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
        SubcategoryService.getSubcategories(),
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
        await SubcategoryService.updateSubcategory(editingId, payload);
      } else {
        await SubcategoryService.createSubcategory(payload);
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Create/Update failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await SubcategoryService.deleteSubcategory(id);
      fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = (sub: Subcategory) => {
    setNewName(sub.name);
    setSelectedParent(typeof sub.parent === "string" ? sub.parent : sub.parent._id);
    setEditingId(sub._id);
  };

  const resetForm = () => {
    setNewName("");
    setSelectedParent("");
    setEditingId(null);
  };

  return (
    <>
      <div>
        <h2>Admin: Subcategories</h2>
        <AdminNavBar />

        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Subcategory name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button onClick={handleCreateOrUpdate}>
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && <button onClick={resetForm}>Cancel</button>}
        </div>

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
                  <button onClick={() => handleEdit(sub)}>Edit</button>
                  <button onClick={() => handleDelete(sub._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="back-button">
        <button onClick={() => navigate(-1)} className="button">
          Go Back
        </button>

        <button className="button">
          <Link to={`/`} style={{ color: "white" }}>
            Return to Main Menu
          </Link>
        </button>
      </div>
    </>
  );
};

export default AdminSubcategories;
