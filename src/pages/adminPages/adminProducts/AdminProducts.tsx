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
      const res = await ProductApi.getProducts("", "", "", 1, 100, true);
      setProducts(Array.isArray(res?.products) ? res.products : []);
    } catch (e) {
      console.error("[fetchProducts] failed:", e);
      setError(
        t("admin.products.errors.fetch", { defaultValue: "Failed to load products." })
      );
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
    } catch (e) {
      console.error("[deleteProduct] failed:", e);
      setError(
        t("admin.products.errors.delete", { defaultValue: "Failed to delete product." })
      );
    }
  };

  const handleEdit = (id: string) => navigate(`/admin/products/edit/${id}`);

  const handleSync = async (id: string) => {
    try {
      await ProductApi.syncPriceStock(id);
      await fetchProducts();
      toast.success(
        t("admin.products.toast.syncSuccess", {
          defaultValue: "Stock & price synced from Erply.",
        })
      );
    } catch (e) {
      console.error("[syncPriceStock] failed:", e);
      setError(t("admin.products.errors.sync", { defaultValue: "Sync failed." }));
    }
  };

  const handleImportByBarcode = async () => {
    const bc =
      (window.prompt(
        t("admin.products.prompt.barcode", {
          defaultValue: "Enter barcode (4–14 digits):",
        })
      ) || "").trim();

    if (!bc) {
      toast.info(
        t("admin.products.errors.barcodeEmpty", {
          defaultValue: "Barcode is empty.",
        })
      );
      return;
    }

    if (!/^\d{4,14}$/.test(bc)) {
      toast.error(
        t("admin.products.errors.barcode", {
          defaultValue: "Invalid code: digits only, length 4–14.",
        })
      );
      return;
    }

    try {
      const res = await ProductApi.ensureByBarcode(bc);

      if (res.ok && res.erplyDraft && res.data) {
        toast.info(
          t("admin.products.toast.draftFromErply", {
            defaultValue: "Draft fetched from Erply. Fill category and save.",
          })
        );

        navigate("/admin/products/create", {
          state: { initialProduct: res.data },
        });
        return;
      }

      if (res.alreadyExists && res.data) {
        const id = res.existingId || (res.data as any)._id;

        if (id) {
          toast.info(
            t("admin.products.toast.alreadyExists", {
              defaultValue: "Product with this barcode already exists. Opening editor.",
            })
          );
          navigate(`/admin/products/edit/${id}`);
          return;
        }
      }

      if (res.notFound) {
        toast.warn(
          res.message ||
            t("admin.products.errors.notFoundErply", {
              defaultValue: "Product not found in Erply.",
            })
        );
        return;
      }

      toast.error(
        res.message ||
          t("admin.products.errors.import", {
            defaultValue: "Import from Erply failed.",
          })
      );
    } catch (e: any) {
      console.error("[ensureByBarcode] failed:", e);

      const serverMsg =
        e?.response?.data?.message ||
        t("admin.products.errors.import", { defaultValue: "Import from Erply failed." });

      toast.error(serverMsg);
    }
  };

  // 👆 ФУНКЦИЮ handleImportByErplyId УДАЛИЛИ — больше нет prompt "Enter Erply product ID"

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

        <button
          onClick={handleImportByBarcode}
          className={`${styles.button} ${styles.syncBtn}`}
        >
          {t("admin.products.buttons.importBarcode", {
            defaultValue: "Add product by barcode",
          })}
        </button>

        {/* КНОПКА "Import by Erply ID" УДАЛЕНА */}
      </div>

      <div className={styles.productTable}>
        <table>
          <thead>
            <tr>
              <th>{t("admin.products.table.images", { defaultValue: "Images" })}</th>
              <th>{t("admin.products.table.name", { defaultValue: "Name" })}</th>
              <th>{t("admin.products.table.category", { defaultValue: "Category" })}</th>
              <th>
                {t("admin.products.table.subcategory", {
                  defaultValue: "Subcategory",
                })}
              </th>
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
                asText(product.name, lang) ||
                t("product.noName", { defaultValue: "No Name" });

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

              const imagesArr = (Array.isArray(product.images)
                ? product.images
                : []) as any[];
              const hasImages = imagesArr.length > 0;

              const firstImgUrl = hasImages
                ? (typeof imagesArr[0] === "string"
                    ? imagesArr[0]
                    : imagesArr[0]?.url) || "/images/no-image.png"
                : "/images/no-image.png";

              const barcode =
                typeof (product as any).barcode === "string" &&
                (product as any).barcode.trim()
                  ? (product as any).barcode.trim()
                  : "—";

              const brand = product.brand || "—";
              const discount =
                product.discount != null ? `${product.discount}%` : "—";
              const featured = product.isFeatured
                ? t("common.yes", { defaultValue: "Yes" })
                : t("common.no", { defaultValue: "No" });
              const active =
                product.isActive !== false
                  ? t("common.yes", { defaultValue: "Yes" })
                  : t("common.no", { defaultValue: "No" });

              // ✅ можно синхронизировать, если есть erplyId ИЛИ валидный штрихкод
              const canSyncFromErply =
                !!(product as any).erplyId ||
                (typeof (product as any).barcode === "string" &&
                  /^\d{4,14}$/.test((product as any).barcode.trim()));

              return (
                <tr key={product._id}>
                  <td
                    data-label={t("admin.products.table.images", {
                      defaultValue: "Images",
                    })}
                  >
                    <img
                      src={firstImgUrl}
                      alt={nameText}
                      className={styles.productImage}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/images/no-image.png";
                      }}
                    />
                  </td>

                  <td
                    data-label={t("admin.products.table.name", {
                      defaultValue: "Name",
                    })}
                  >
                    {nameText}
                  </td>

                  <td
                    data-label={t("admin.products.table.category", {
                      defaultValue: "Category",
                    })}
                  >
                    {categoryName}
                  </td>

                  <td
                    data-label={t("admin.products.table.subcategory", {
                      defaultValue: "Subcategory",
                    })}
                  >
                    {subcategoryName}
                  </td>

                  <td
                    data-label={t("admin.products.table.brand", {
                      defaultValue: "Brand",
                    })}
                  >
                    {brand}
                  </td>

                  <td
                    data-label={t("admin.products.table.discount", {
                      defaultValue: "Discount",
                    })}
                  >
                    {discount}
                  </td>

                  <td
                    data-label={t("admin.products.table.barcode", {
                      defaultValue: "Barcode",
                    })}
                    title={barcode}
                  >
                    {barcode}
                  </td>

                  <td
                    data-label={t("admin.products.table.price", {
                      defaultValue: "Price",
                    })}
                  >
                    €{price}
                  </td>

                  <td
                    data-label={t("admin.products.table.stock", {
                      defaultValue: "Stock",
                    })}
                  >
                    {product.stock ?? 0}
                  </td>

                  <td
                    data-label={t("admin.products.table.featured", {
                      defaultValue: "Featured",
                    })}
                  >
                    {featured}
                  </td>

                  <td
                    data-label={t("admin.products.table.active", {
                      defaultValue: "Active",
                    })}
                  >
                    {active}
                  </td>

                  <td
                    data-label={t("admin.products.table.actions", {
                      defaultValue: "Actions",
                    })}
                    className={styles.actionsCell}
                  >
                    {canSyncFromErply && (
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
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminProducts;


