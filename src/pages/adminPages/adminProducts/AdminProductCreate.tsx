// src/pages/adminPages/adminProducts/AdminProductCreate.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { createProduct } from "../../../services/ProductService";
import { toast } from "react-toastify";
import { CreateProductPayload, Product } from "../../../types/product";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProductCreateAndEdit.module.css";
import { useTranslation } from "react-i18next";

type LocationState = {
  initialProduct?: Partial<Product>;
} | null;

const AdminProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");

  const state = location.state as LocationState;
  const initialDataFromState = state?.initialProduct;

  const handleSubmit = async (formData: FormData) => {
    try {
      const files = formData
        .getAll("images")
        .filter((f): f is File => f instanceof File);

      const subRaw = formData.get("subcategory");
      const subcategory =
        typeof subRaw === "string" && subRaw.trim() ? subRaw : undefined;

      const bcRaw = formData.get("barcode");
      const barcode = typeof bcRaw === "string" ? bcRaw.trim() : "";

      const brandRaw = formData.get("brand");
      const brand =
        typeof brandRaw === "string" && brandRaw.trim() ? brandRaw.trim() : undefined;

      const discountRaw = formData.get("discount");
      const discount =
        typeof discountRaw === "string" && discountRaw.trim()
          ? parseFloat(discountRaw)
          : undefined;

      const featuredRaw = formData.get("isFeatured");
      const isFeatured = featuredRaw === "true" || featuredRaw === "on";

      const activeRaw = formData.get("isActive");
      const isActive = activeRaw === "true" || activeRaw === "on";

      const productData: CreateProductPayload = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        ...(subcategory ? { subcategory } : {}),
        stock: parseInt(formData.get("stock") as string, 10),
        images: files,
        barcode,
        ...(brand ? { brand } : {}),
        ...(discount !== undefined ? { discount } : {}),
        isFeatured,
        isActive,
      };

      await createProduct(productData);

      toast.success(
        t("admin.products.create.toast.success", { defaultValue: "Product created!" })
      );
      navigate("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error(
        t("admin.products.create.toast.fail", {
          defaultValue: "Failed to create product.",
        })
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <AdminNavBar />
        <h2 className={styles.heading}>
          {t("admin.products.create.title", { defaultValue: "Create New Product" })}
        </h2>
        <AdminProductForm
          initialData={initialDataFromState}
          submitText={t("admin.products.create.submit", {
            defaultValue: "Create Product",
          })}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default AdminProductCreate;
