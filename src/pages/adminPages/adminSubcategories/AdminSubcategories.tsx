// src/pages/admin/subcategories/AdminSubcategories.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Subcategory, SubcategoryPayload } from "../../../types/subcategory";
import { Category, LocalizedField } from "../../../types/category";
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
import { useTranslation } from "react-i18next";

function pickLocalized(value: unknown, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();

  const v = value as LocalizedField & Record<string, any>;
  const short = (lang || "en").slice(0, 2);

  if (typeof v[short] === "string" && v[short]!.trim()) return v[short]!.trim();
  if (typeof v._source === "string" && typeof v[v._source] === "string" && v[v._source]!.trim()) {
    return v[v._source]!.trim();
  }
  if (typeof v.en === "string" && v.en.trim()) return v.en.trim();
  if (typeof v.ru === "string" && v.ru.trim()) return v.ru.trim();
  if (typeof v.fi === "string" && v.fi.trim()) return v.fi.trim();

  return "";
}

function isCanceledError(e: any) {
  return e?.code === "ERR_CANCELED" || e?.name === "CanceledError" || e?.message === "canceled";
}

const AdminSubcategories: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  const lang = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSeq = useRef(0);

  const fetchData = async (curLang: string) => {
    const seq = ++loadSeq.current;
    try {
      setLoading(true);
      setError(null);

      const [subs, cats] = await Promise.all([

        getSubcategories(),
        getCategories(),
      ]);

      if (seq !== loadSeq.current) return;

      setSubcategories(Array.isArray(subs) ? subs : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e: any) {
      if (isCanceledError(e)) return; 
      console.error("Error loading data:", e);
      setError(t("admin.subcategories.errors.load", { defaultValue: "Failed to load data" }));
      setSubcategories([]);
      setCategories([]);
    } finally {
      if (seq === loadSeq.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(lang);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {}
    fetchData(lang);
 
  }, [lang]);

  const categoriesWithLabel = useMemo(
    () =>
      (categories || []).map((c) => ({
        ...c,
        _label: pickLocalized(c.name as any, lang) || "—",
      })),
    [categories, lang]
  );

  const subcategoriesWithLabel = useMemo(
    () =>
      (subcategories || []).map((s) => ({
        ...s,
        _label: pickLocalized(s.name as any, lang) || "—",
        _parentId: typeof s.parent === "string" ? s.parent : (s.parent?._id as string | undefined),
        _parentLabel:
          typeof s.parent === "string"
            ? pickLocalized(categories.find((c) => c._id === s.parent)?.name as any, lang) ||
              (s.parent as string)
            : pickLocalized((s.parent as Category | undefined)?.name as any, lang) || "—",
      })),
    [subcategories, categories, lang]
  );

  const hasDuplicate = (name: string, parentId: string, skipId?: string) => {
    const n = name.trim().toLowerCase();
    const p = parentId.trim();
    return subcategoriesWithLabel.some(
      (s) =>
        s._id !== skipId &&
        (s._parentId || "") === p &&
        (s._label || "").trim().toLowerCase() === n
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
      setError(
        t("admin.subcategories.errors.duplicate", {
          defaultValue: "Subcategory with this name already exists in the selected category",
        })
      );
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
      await fetchData(lang); 
    } catch (e) {
      console.error("Create/Update failed:", e);
      setError(t("admin.subcategories.errors.save", { defaultValue: "Failed to save subcategory" }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.subcategories.confirm.delete", { defaultValue: "Delete this subcategory?" })))
      return;
    try {
      await deleteSubcategory(id);
      setSubcategories((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
      setError(t("admin.subcategories.errors.delete", { defaultValue: "Failed to delete subcategory" }));
    }
  };

  const handleEdit = (sub: Subcategory & { _label?: string; _parentId?: string }) => {
    const label = pickLocalized(sub.name as any, lang) || "";
    setNewName(label);
    setSelectedParent(typeof sub.parent === "string" ? sub.parent : sub.parent?._id || "");
    setEditingId(sub._id);
    setError(null);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        {t("loading.default", { defaultValue: "Loading..." })}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.adminSubcategories}>
        <div className={styles.container}>
          <h2 className={styles.heading}>
            {t("admin.subcategories.title", { defaultValue: "Admin: Subcategories" })}
          </h2>
          <AdminNavBar />

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.form}>
            <input
              type="text"
              placeholder={t("admin.subcategories.form.name", { defaultValue: "Subcategory name" })}
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
              <option value="">
                {t("admin.subcategories.form.selectParent", { defaultValue: "Select category" })}
              </option>
              {categoriesWithLabel
                .slice()
                .sort((a, b) => a._label.localeCompare(b._label))
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat._label}
                  </option>
                ))}
            </select>

            <button
              onClick={handleCreateOrUpdate}
              className={styles.button}
              disabled={saving || !newName.trim() || !selectedParent}
            >
              {saving
                ? t("admin.subcategories.buttons.saving", { defaultValue: "Saving..." })
                : editingId
                ? t("admin.subcategories.buttons.update", { defaultValue: "Update" })
                : t("admin.subcategories.buttons.create", { defaultValue: "Create" })}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className={`${styles.button} ${styles.cancelButton}`}
                disabled={saving}
              >
                {t("admin.subcategories.buttons.cancel", { defaultValue: "Cancel" })}
              </button>
            )}
          </div>

          <div className={styles.subcategoryTable}>
            <table>
              <thead>
                <tr>
                  <th>{t("admin.subcategories.table.name", { defaultValue: "Name" })}</th>
                  <th>{t("admin.subcategories.table.parent", { defaultValue: "Parent Category" })}</th>
                  <th>{t("admin.subcategories.table.actions", { defaultValue: "Actions" })}</th>
                </tr>
              </thead>
              <tbody>
                {subcategoriesWithLabel
                  .slice()
                  .sort((a, b) => a._label.localeCompare(b._label))
                  .map((sub) => (
                    <tr key={sub._id}>
                      <td>{sub._label}</td>
                      <td>{sub._parentLabel}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(sub)}
                          className={`${styles.button} ${styles.editBtn}`}
                        >
                          {t("admin.subcategories.buttons.edit", { defaultValue: "Edit" })}
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className={`${styles.button} ${styles.deleteBtn}`}
                        >
                          {t("admin.subcategories.buttons.delete", { defaultValue: "Delete" })}
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
    </div>
  );
};

export default AdminSubcategories;
