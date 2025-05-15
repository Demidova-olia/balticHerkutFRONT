import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../../services/ProductService";
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

      if (
        typeof name !== "string" ||
        typeof description !== "string" ||
        typeof price !== "string" ||
        typeof stock !== "string" ||
        typeof category !== "string" ||
        typeof subcategory !== "string"
      ) {
        toast.error("Invalid form data.");
        return;
      }

      const files = formData.getAll("images");
      const images = files.filter(file => typeof file !== "string") as (
        File | { url: string; public_id: string }
      )[];

      const formDataObj: ProductData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        subcategory,
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
        />
      )}
    </div>
  );
};

export default AdminProductEdit;
