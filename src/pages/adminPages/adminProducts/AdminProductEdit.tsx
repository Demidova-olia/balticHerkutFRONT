import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../../services/ProductService";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { Product, ProductData } from "../../../types/product";
import { toast } from "react-toastify";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProducts.module.css";

const AdminProductEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const fetchedProduct = await getProductById(id);
          setProduct(fetchedProduct);
        } catch {
          setError("Failed to fetch product.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
  if (!product || !product._id) return;

  try {
    const files = formData.getAll("images");

    const images: (File | { url: string; public_id: string })[] = files.map(file => {
      if (typeof file === "string") {
        return null;
      }
      return file;
    }).filter(Boolean) as (File | { url: string; public_id: string })[];

    const formDataObj: ProductData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      subcategory: formData.get("subcategory") as string,
      stock: parseInt(formData.get("stock") as string),
      images,
    };

    await updateProduct(product._id, formDataObj);
    toast.success("Product updated!");
    navigate("/admin/products");
  } catch (err) {
    console.error("Error updating product:", err);
    toast.error("Failed to update product.");
  }
};


  if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;
  if (error) return <div className="text-center text-lg font-semibold text-red-600">{error}</div>;

  return (
    <div className={styles.container}>
      <AdminNavBar />
      <h2 className={styles.heading}>Edit Product</h2>
      {product && (
        <AdminProductForm
          initialData={product}
          submitText="Update Product"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AdminProductEdit;
