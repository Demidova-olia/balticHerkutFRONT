import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct, deleteProductImage } from "../../../services/ProductService";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { Product, ProductData } from "../../../types/product";
import { toast } from "react-toastify";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProducts.module.css";

const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        console.error("Error fetching product:", err);
        setError("Failed to fetch product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

const handleSubmit = async (formData: FormData) => {
  if (!product || !product._id) return;

  try {
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const stock = formData.get("stock");
    const category = formData.get("category");
    const subcategory = formData.get("subcategory");
    const removeAllImages = formData.get("removeAllImages") === "true";

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof price !== "string" ||
      typeof stock !== "string" ||
      typeof category !== "string"
    ) {
      toast.error("Invalid form data.");
      return;
    }

    const files = formData.getAll("images");
    const images = files.filter(file => file instanceof File) as File[];

    const formDataObj: ProductData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      subcategory: typeof subcategory === "string" ? subcategory : "",
      images,
    };

    const existingImages = (product.images || []).filter(
      (img): img is { url: string; public_id: string } => typeof img !== "string"
    );

    await updateProduct(product._id, formDataObj, existingImages, removeAllImages);
    toast.success("Product updated!");
    navigate("/admin/products");
  } catch (err) {
    console.error("Error updating product:", err);
    toast.error("Failed to update product.");
  }
};
 const handleImageDelete = async (publicId: string) => {
  if (!product || !product._id) return;
  try {
    await deleteProductImage(product._id, publicId);
    setProduct(prev =>
      prev
        ? {
            ...prev,
            images: prev.images?.filter(
              img => typeof img !== "string" && img.public_id !== publicId
            ),
          }
        : prev
    );
    toast.success("Image deleted");
  } catch (err) {
    console.error("Error deleting image:", err);
    toast.error("Failed to delete image");
  }
};

  if (loading) {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-lg font-semibold text-red-600">{error}</div>;
  }

  return (
    <div className={styles.container}>
      <AdminNavBar />
      <h2 className={styles.heading}>Edit Product</h2>
      {product && (
        <AdminProductForm
          initialData={product}
          submitText="Update Product"
          onSubmit={handleSubmit}
          onImageDelete={handleImageDelete}
        />
      )}
    </div>
  );
};

export default AdminProductEdit;
