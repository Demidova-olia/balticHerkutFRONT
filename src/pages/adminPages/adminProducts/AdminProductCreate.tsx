import React from "react";
import { useNavigate } from "react-router-dom";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { createProduct } from "../../../services/ProductService";
import { toast } from "react-toastify";
import { ProductData } from "../../../types/product";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProduct.module.css"
const AdminProductCreate: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    try {
      const images = formData.getAll("images") as File[];

      const productData: ProductData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        subcategory: formData.get("subcategory") as string,
        stock: parseInt(formData.get("stock") as string),
        images,
      };

      await createProduct(productData);
      toast.success("Product created!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error("Failed to create product.");
    }
  };

  return (
    <div className={styles.container}>
      <AdminNavBar />
      <h2 className={styles.heading}>Create New Product</h2>
      <AdminProductForm
        submitText="Create Product"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminProductCreate;
