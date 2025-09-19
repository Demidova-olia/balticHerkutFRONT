// src/pages/adminPages/adminProducts/AdminProductEdit.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  updateProduct,
  deleteProductImage,
} from "../../../services/ProductService";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { Product, ProductData } from "../../../types/product";
import { toast } from "react-toastify";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProductCreateAndEdit.module.css";
import { useTranslation } from "react-i18next";

const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching product:", err);
        setError(
          t("admin.products.edit.toast.fetchFail", {
            defaultValue: "Failed to fetch product.",
          })
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    if (!product || !product._id) return;

    try {
      const name = formData.get("name");
      const description = formData.get("description");
      const price = formData.get("price");
      const stock = formData.get("stock");
      const category = formData.get("category");
      const subcategoryRaw = formData.get("subcategory");
      const removeAllImages = formData.get("removeAllImages") === "true";
      const barcodeRaw = formData.get("barcode");

      if (
        typeof name !== "string" ||
        typeof description !== "string" ||
        typeof price !== "string" ||
        typeof stock !== "string" ||
        typeof category !== "string"
      ) {
        toast.error(
          t("admin.products.edit.toast.invalidForm", {
            defaultValue: "Invalid form data.",
          })
        );
        return;
      }

      // изображения, загружаемые сейчас
      const files = formData.getAll("images");
      const images = files.filter((file) => file instanceof File) as File[];

      // аккуратная обработка подкатегории (пустая строка -> undefined)
      const subcategory =
        typeof subcategoryRaw === "string" && subcategoryRaw.trim()
          ? subcategoryRaw
          : undefined;

      // штрих-код, если введён
      const barcode =
        typeof barcodeRaw === "string" && barcodeRaw.trim()
          ? barcodeRaw.trim()
          : undefined;

      const formDataObj: ProductData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category,
        ...(subcategory ? { subcategory } : {}),
        images,
        ...(barcode ? { barcode } : {}),
      };

      // существующие картинки (оставляем те, что не удалили)
      const existingImages = (product.images || []).filter(
        (img): img is { url: string; public_id: string } =>
          typeof img !== "string"
      );

      await updateProduct(
        product._id,
        formDataObj,
        existingImages,
        removeAllImages
      );

      toast.success(
        t("admin.products.edit.toast.updated", {
          defaultValue: "Product updated!",
        })
      );
      navigate("/admin/products");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error updating product:", err);
      toast.error(
        t("admin.products.errors.fetch", {
          defaultValue: "Failed to load products.",
        })
      );
    }
  };

  const handleImageDelete = async (publicId: string) => {
    if (!product || !product._id) return;
    try {
      await deleteProductImage(product._id, publicId);
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              images: prev.images?.filter(
                (img) => typeof img !== "string" && img.public_id !== publicId
              ),
            }
          : prev
      );
      toast.success(
        t("admin.products.edit.toast.imgDeleted", {
          defaultValue: "Image deleted",
        })
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error deleting image:", err);
      toast.error(
        t("admin.products.edit.toast.imgDeleteFail", {
          defaultValue: "Failed to delete image",
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center text-lg font-semibold">
        {t("loading.default", { defaultValue: "Loading..." })}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-lg font-semibold text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <AdminNavBar />
        <h2 className={styles.heading}>
          {t("admin.products.edit.title", { defaultValue: "Edit Product" })}
        </h2>
        {product && (
          <AdminProductForm
            initialData={product}
            submitText={t("admin.products.edit.submit", {
              defaultValue: "Update Product",
            })}
            onSubmit={handleSubmit}
            onImageDelete={handleImageDelete}
          />
        )}
      </div>
    </div>
  );
};

export default AdminProductEdit;
