import React, { useEffect, useMemo, useState } from "react";
import { Product, Lang, asText } from "../../types/product";
import { Category } from "../../types/category";
import { Subcategory } from "../../types/subcategory";
import { getCategories } from "../../services/CategoryService";
import { getSubcategories } from "../../services/SubcategoryService";
import styles from "./AdminProductForm.module.css";
import { useTranslation } from "react-i18next";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: FormData) => void;
  onImageDelete?: (publicId: string) => void;
  submitText: string;
}

type ExistingImg = { url: string; public_id: string };
type FormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
};

const AdminProductForm: React.FC<ProductFormProps> = ({
  initialData = {},
  onSubmit,
  onImageDelete,
  submitText,
}) => {
  const { t, i18n } = useTranslation("common");
  const lang = useMemo<Lang>(
    () => ((i18n.resolvedLanguage || i18n.language || "en").slice(0, 2) as Lang),
    [i18n.resolvedLanguage, i18n.language]
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeAllImages, setRemoveAllImages] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    name: typeof initialData.name === "string" ? initialData.name : asText(initialData.name || "", lang),
    description:
      typeof initialData.description === "string"
        ? initialData.description
        : asText(initialData.description || "", lang),
    price: initialData.price != null ? String(initialData.price) : "",
    stock: initialData.stock != null ? String(initialData.stock) : "",
  });

  const [existingImages, setExistingImages] = useState<ExistingImg[]>(
    Array.isArray(initialData.images)
      ? initialData.images.filter((img): img is ExistingImg => typeof img !== "string")
      : []
  );

  // Load categories & subcategories
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    getSubcategories().then(setAllSubcategories).catch(console.error);
  }, []);

  // Sync when initialData changes (e.g. edit page)
  useEffect(() => {
    const nextName =
      typeof initialData.name === "string" ? initialData.name : asText(initialData.name || "", lang);
    const nextDesc =
      typeof initialData.description === "string"
        ? initialData.description
        : asText(initialData.description || "", lang);

    setFormState({
      name: nextName,
      description: nextDesc,
      price: initialData.price != null ? String(initialData.price) : "",
      stock: initialData.stock != null ? String(initialData.stock) : "",
    });

    const catId =
      typeof initialData.category === "string"
        ? initialData.category
        : (initialData.category as any)?._id || "";

    const subId =
      typeof initialData.subcategory === "string"
        ? initialData.subcategory
        : (initialData.subcategory as any)?._id || "";

    setSelectedCategory(catId);
    setSelectedSubcategory(subId);

    const ex =
      Array.isArray(initialData.images)
        ? initialData.images.filter((img): img is ExistingImg => typeof img !== "string")
        : [];
    setExistingImages(ex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, lang]);

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return allSubcategories.filter((sub) =>
      typeof sub.parent === "string" ? sub.parent === selectedCategory : sub.parent._id === selectedCategory
    );
  }, [selectedCategory, allSubcategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = Array.from(e.target.files).filter(
        (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
      );
      setImages(validFiles);
    }
  };

  const handleImageDelete = async (publicId: string) => {
    if (!onImageDelete) return;
    try {
      await onImageDelete(publicId);
      setExistingImages((prev) => prev.filter((img) => img.public_id !== publicId));
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(t("admin.productForm.alerts.deleteImageError", { defaultValue: "Error deleting image." }));
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      // eslint-disable-next-line no-alert
      alert(t("admin.productForm.alerts.selectCategory", { defaultValue: "Please select a category." }));
      return;
    }

    if (Number(formState.price) < 0 || Number(formState.stock) < 0) {
      // eslint-disable-next-line no-alert
      alert(t("admin.productForm.alerts.nonNegative", { defaultValue: "Price and stock cannot be negative." }));
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("description", formState.description);
      formData.append("price", formState.price);
      formData.append("stock", formState.stock);
      formData.append("category", selectedCategory);
      if (selectedSubcategory) formData.append("subcategory", selectedSubcategory);

      images.forEach((img) => formData.append("images", img));

      if (removeAllImages || (!images.length && !existingImages.length)) {
        formData.append("removeAllImages", "true");
      }

      onSubmit(formData);

      if (!initialData._id) {
        setFormState({ name: "", description: "", price: "", stock: "" });
        setSelectedCategory("");
        setSelectedSubcategory("");
        setImages([]);
        setExistingImages([]);
        setRemoveAllImages(false);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error submitting form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formField}>
        <label className={styles.label}>
          {t("admin.productForm.labels.name", { defaultValue: "Name" })}
        </label>
        <input
          type="text"
          name="name"
          value={formState.name}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>
          {t("admin.productForm.labels.description", { defaultValue: "Description" })}
        </label>
        <textarea
          name="description"
          value={formState.description}
          onChange={handleChange}
          required
          className={styles.textarea}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>
          {t("admin.productForm.labels.price", { defaultValue: "Price" })}
        </label>
        <input
          type="number"
          name="price"
          value={formState.price}
          onChange={handleChange}
          required
          className={styles.input}
          min={0}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>
          {t("admin.productForm.labels.stock", { defaultValue: "Stock" })}
        </label>
        <input
          type="number"
          name="stock"
          value={formState.stock}
          onChange={handleChange}
          required
          className={styles.input}
          min={0}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>
          {t("admin.productForm.labels.category", { defaultValue: "Category" })}
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          required
          className={styles.select}
        >
          <option value="">
            {t("admin.productForm.selectOption", { defaultValue: "Select" })}
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {asText(cat.name as any, lang) || "—"}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>
          {t("admin.productForm.labels.subcategory", { defaultValue: "Subcategory" })}
        </label>
        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          disabled={!filteredSubcategories.length}
          className={styles.select}
        >
          <option value="">
            {t("admin.productForm.selectOption", { defaultValue: "Select" })}
          </option>
          {filteredSubcategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {asText(sub.name as any, lang) || "—"}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>
          {t("admin.productForm.labels.upload", { defaultValue: "Upload New Images" })}
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className={styles.fileInput}
        />
      </div>

      {images.length > 0 && (
        <div className={styles.imagePreview}>
          <label className={styles.label}>
            {t("admin.productForm.labels.newPreview", { defaultValue: "New Images Preview:" })}
          </label>
          <div className={styles.imageGrid}>
            {images.map((img) => (
              <img
                key={`${img.name}-${img.lastModified}`}
                src={URL.createObjectURL(img)}
                alt="preview"
              />
            ))}
          </div>
        </div>
      )}

      {existingImages.length > 0 && (
        <div className={styles.imagePreview}>
          <label className={styles.label}>
            {t("admin.productForm.labels.currentImages", { defaultValue: "Current Images:" })}
          </label>
          <div className={styles.imageGrid}>
            {existingImages.map((img) => (
              <div key={img.public_id} className={styles.imageItem}>
                <img src={img.url} alt="Existing" />
                <button
                  type="button"
                  onClick={() => handleImageDelete(img.public_id)}
                  className={styles.button}
                >
                  {t("admin.products.buttons.delete", { defaultValue: "Delete" })}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {existingImages.length > 0 && (
        <div className={styles.formField}>
          <label className={styles.label} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={removeAllImages}
              onChange={(e) => setRemoveAllImages(e.target.checked)}
            />
            {t("admin.productForm.labels.removeAll", { defaultValue: "Remove all images" })}
          </label>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting
          ? t("admin.productForm.buttons.submitting", { defaultValue: "Submitting..." })
          : submitText}
      </button>
    </form>
  );
};

export default AdminProductForm;
