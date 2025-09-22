// src/pages/adminPages/adminProducts/AdminProductCreate.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { createProduct } from "../../../services/ProductService";
import { toast } from "react-toastify";
import { ProductData } from "../../../types/product";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProductCreateAndEdit.module.css";
import { useTranslation } from "react-i18next";

const AdminProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const handleSubmit = async (formData: FormData) => {
    try {
      const files = formData
        .getAll("images")
        .filter((f): f is File => f instanceof File);

      // аккуратно берём подкатегорию: пустую строку не отправляем
      const subRaw = formData.get("subcategory");
      const subcategory =
        typeof subRaw === "string" && subRaw.trim() ? subRaw : undefined;

      // ⬇️ добавляем barcode (пустая строка допустима — значит «нет штрих-кода»)
      const bcRaw = formData.get("barcode");
      const barcode = typeof bcRaw === "string" ? bcRaw.trim() : "";

      const productData: ProductData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        ...(subcategory ? { subcategory } : {}),
        stock: parseInt(formData.get("stock") as string, 10),
        images: files,
        barcode, // <<< важно: теперь уходит на бэкенд
      };

      await createProduct(productData);
      toast.success(
        t("admin.products.create.toast.success", { defaultValue: "Product created!" })
      );
      navigate("/admin/products");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error creating product:", err);
      toast.error(
        t("admin.products.create.toast.fail", { defaultValue: "Failed to create product." })
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
          submitText={t("admin.products.create.submit", { defaultValue: "Create Product" })}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default AdminProductCreate;
