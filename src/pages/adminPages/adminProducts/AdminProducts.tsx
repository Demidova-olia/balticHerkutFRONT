// src/pages/adminPages/adminProducts/AdminProducts.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as ProductApi from "../../../services/ProductService";
import { Product, Lang, asText } from "../../../types/product";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProducts.module.css";
import BottomNav from "../../../components/Admin/BottomNav";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

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
      const res = await ProductApi.getProducts("", "", "", 1, 100);
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
      await ProductApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError(t("admin.products.errors.delete", { defaultValue: "Failed to delete product." }));
    }
  };

  const handleEdit = (id: string) => navigate(`/admin/products/edit/${id}`);

  const handleSync = async (id: string) => {
    try {
      await ProductApi.syncPriceStock(id);
      await fetchProducts();
      toast.success(t("admin.products.buttons.sync", { defaultValue: "Sync" }));
    } catch {
      setError(t("admin.products.errors.sync", { defaultValue: "Sync failed." }));
    }
  };

  const handleImportByBarcode = async () => {
    const bc =
      (window.prompt(
        t("admin.products.prompt.barcode", { defaultValue: "Enter barcode (8–14 digits):" })
      ) || "").trim();

    if (!bc) return;
    if (!/^\d{8,14}$/.test(bc)) {
      toast.error(
        t("admin.products.errors.barcode", {
          defaultValue: "Invalid barcode: digits only, length 8–14.",
        })
      );
      return;
    }

    try {
      await ProductApi.ensureByBarcode(bc);
      await fetchProducts();
      toast.success(
        t("admin.products.toast.imported", { defaultValue: "Imported from Erply (by barcode)!" })
      );
    } catch (e) {
      console.error(e);
      toast.error(t("admin.products.errors.import", { defaultValue: "Import from Erply failed." }));
    }
  };

  const handleImportByErplyId = async () => {
    const erplyId =
      (window.prompt(
        t("admin.products.prompt.erplyId", { defaultValue: "Enter Erply product ID:" })
      ) || "").trim();

    if (!erplyId) return;

    try {
      await ProductApi.importFromErplyById(erplyId);
      await fetchProducts();
      toast.success(
        t("admin.products.toast.importedId", { defaultValue: "Imported from Erply (by ID)!" })
      );
    } catch (e) {
      console.error(e);
      toast.error(t("admin.products.errors.import", { defaultValue: "Import from Erply failed." }));
    }
  };

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
        <button onClick={() => navigate("/admin/products/create")} className={styles.addProductBtn}>
          {t("admin.products.buttons.addNew", { defaultValue: "Add New Product" })}
        </button>

        <button onClick={handleImportByBarcode} className={`${styles.button} ${styles.syncBtn}`}>
          {t("admin.products.buttons.importBarcode", { defaultValue: "Import by barcode" })}
        </button>
        <button onClick={handleImportByErplyId} className={`${styles.button} ${styles.syncBtn}`}>
          {t("admin.products.buttons.importId", { defaultValue: "Import by Erply ID" })}
        </button>
      </div>

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>{t("admin.products.table.images", { defaultValue: "Images" })}</th>
            <th>{t("admin.products.table.name", { defaultValue: "Name" })}</th>
            <th>{t("admin.products.table.category", { defaultValue: "Category" })}</th>
            <th>{t("admin.products.table.subcategory", { defaultValue: "Subcategory" })}</th>
            <th>{t("admin.products.table.brand", { defaultValue: "Brand" })}</th>
            <th>{t("admin.products.table.discount", { defaultValue: "Discount" })}</th>
            <th>{t("admin.products.table.barcode", { defaultValue: "Barcode" })}</th>
            <th>{t("admin.products.table.price", { defaultValue: "Price" })}</th>
            <th>{t("admin.products.table.stock", { defaultValue: "Stock" })}</th>
            <th>{t("admin.products.table.featured", { defaultValue: "Featured" })}</th>
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

            const firstImgUrl = hasImages
              ? (typeof imagesArr[0] === "string" ? imagesArr[0] : imagesArr[0]?.url) ||
                "/images/no-image.png"
              : "/images/no-image.png";

            const barcode =
              typeof (product as any).barcode === "string" && (product as any).barcode.trim()
                ? (product as any).barcode.trim()
                : "—";

            const brand = product.brand || "—";
            const discount = product.discount != null ? `${product.discount}%` : "—";
            const featured = product.isFeatured
              ? t("common.yes", { defaultValue: "Yes" })
              : t("common.no", { defaultValue: "No" });
            const active =
              product.isActive !== false
                ? t("common.yes", { defaultValue: "Yes" })
                : t("common.no", { defaultValue: "No" });

            return (
              <tr key={product._id}>
                <td>
                  <img
                    src={firstImgUrl}
                    alt={nameText}
                    className={styles.productImage}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                    }}
                  />
                </td>
                <td>{nameText}</td>
                <td>{categoryName}</td>
                <td>{subcategoryName}</td>
                <td>{brand}</td>
                <td>{discount}</td>
                <td title={barcode}>{barcode}</td>
                <td>€{price}</td>
                <td>{product.stock ?? 0}</td>
                <td>{featured}</td>
                <td>{active}</td>
                <td>
                  {product.erplyId && (
                    <button
                      onClick={() => handleSync(product._id)}
                      className={`${styles.button} ${styles.syncBtn}`}
                      title={t("admin.products.buttons.sync", {
                        defaultValue: "Sync price & stock from ERP",
                      })}
                    >
                      {t("admin.products.buttons.sync", { defaultValue: "Sync" })}
                    </button>
                  )}
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
