// src/pages/adminPages/adminProducts/AdminProducts.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as ProductService from "../../../services/ProductService";
import { Product, Lang, asText } from "../../../types/product";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProducts.module.css";
import BottomNav from "../../../components/Admin/BottomNav";
import { useTranslation } from "react-i18next";

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { i18n, t } = useTranslation("common");

  const lang = useMemo<Lang>(
    () => ((i18n.resolvedLanguage || i18n.language || "en").slice(0, 2) as Lang),
    [i18n.resolvedLanguage, i18n.language]
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ProductService.getProducts("", "", "", 1, 100);
      setProducts(Array.isArray(res?.products) ? res.products : []);
    } catch {
      setError(t("admin.products.errors.fetch", { defaultValue: "Failed to load products." }));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        t("admin.products.confirmDelete", {
          defaultValue: "Are you sure you want to delete this product?",
        })
      )
    )
      return;
    try {
      await ProductService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError(t("admin.products.errors.delete", { defaultValue: "Failed to delete product." }));
    }
  };

  const handleEdit = (id: string) => navigate(`/admin/products/edit/${id}`);

  const sorted = useMemo(
    () =>
      products
        .slice()
        .sort((a, b) =>
          asText(a.name, lang).localeCompare(asText(b.name, lang), i18n.language, {
            sensitivity: "base",
          })
        ),
    [products, lang, i18n.language]
  );

  if (loading) {
    return (
      <p className={styles.loading}>
        {t("loading.products", { defaultValue: "Loading products..." })}
      </p>
    );
  }

  return (
    <div className={styles.adminProducts}>
      <h2 className={styles.heading}>
        {t("admin.products.title", { defaultValue: "Manage Products" })}
      </h2>
      <AdminNavBar />

      {error && (
        <div className={styles.error}>
          {error}{" "}
          <button className={styles.retryBtn} onClick={fetchProducts}>
            {t("admin.metrics.refresh", { defaultValue: "Refresh" })}
          </button>
        </div>
      )}

      <div className={styles.topBar}>
        <button
          onClick={() => navigate("/admin/products/create")}
          className={styles.addProductBtn}
        >
          {t("admin.products.buttons.addNew", { defaultValue: "Add New Product" })}
        </button>
      </div>

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>{t("admin.products.table.images", { defaultValue: "Images" })}</th>
            <th>{t("admin.products.table.name", { defaultValue: "Name" })}</th>
            <th>{t("admin.products.table.category", { defaultValue: "Category" })}</th>
            <th>{t("admin.products.table.subcategory", { defaultValue: "Subcategory" })}</th>
            <th>{t("admin.products.table.barcode", { defaultValue: "Barcode" })}</th>
            <th>{t("admin.products.table.price", { defaultValue: "Price" })}</th>
            <th>{t("admin.products.table.stock", { defaultValue: "Stock" })}</th>
            <th>{t("admin.products.table.active", { defaultValue: "Active" })}</th>
            <th>{t("admin.products.table.actions", { defaultValue: "Actions" })}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((product) => {
            const nameText =
              asText(product.name, lang) || t("product.noName", { defaultValue: "No Name" });

            const categoryName =
              typeof product.category === "string"
                ? product.category
                : asText((product as any).category?.name, lang) || "—";

            const subcategoryName =
              typeof product.subcategory === "string"
                ? product.subcategory
                : asText((product as any).subcategory?.name, lang) || "—";

            const price =
              typeof product.price === "number" && isFinite(product.price)
                ? product.price.toFixed(2)
                : "0.00";

            const imagesArr = (Array.isArray(product.images) ? product.images : []) as any[];
            const hasImages = imagesArr.length > 0;

            const barcode =
              typeof (product as any).barcode === "string" && (product as any).barcode.trim()
                ? (product as any).barcode.trim()
                : "—";

            return (
              <tr key={product._id}>
                <td>
                  {hasImages ? (
                    <div className={styles.imageGallery}>
                      {imagesArr.map((image, index) => {
                        const imgUrl =
                          typeof image === "string"
                            ? image
                            : image?.url || "/images/no-image.png";
                        return (
                          <img
                            key={`${product._id}-${index}`}
                            src={imgUrl}
                            alt={`${nameText} ${index + 1}`}
                            className={styles.productImage}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    t("admin.products.noImage", { defaultValue: "No image" })
                  )}
                </td>

                <td>{nameText}</td>
                <td>{categoryName}</td>
                <td>{subcategoryName}</td>
                <td title={barcode}>{barcode}</td>
                <td>€{price}</td>
                <td>{product.stock ?? 0}</td>
                <td>
                  {product.isActive
                    ? t("common.yes", { defaultValue: "Yes" })
                    : t("common.no", { defaultValue: "No" })}
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(product._id)}
                    className={`${styles.button} ${styles.editBtn}`}
                  >
                    {t("common.edit", { defaultValue: "Edit" })}
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className={`${styles.button} ${styles.deleteBtn}`}
                  >
                    {t("common.delete", { defaultValue: "Delete" })}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <BottomNav />
    </div>
  );
};

export default AdminProducts;
