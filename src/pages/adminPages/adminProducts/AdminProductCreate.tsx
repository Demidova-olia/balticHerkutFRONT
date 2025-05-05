import React from "react";
import { useNavigate } from "react-router-dom";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { createProduct } from "../../../services/ProductService";
import { toast } from "react-toastify";
import { ProductData } from "../../../types/product";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";

const AdminProductCreate: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    try {
      const formDataObj: ProductData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        subcategory: formData.get("subcategory") as string,
        stock: parseInt(formData.get("stock") as string),
        images: []
      };

      await createProduct(formDataObj, []);
      toast.success("Product created!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error("Failed to create product.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Product</h2>
      <AdminNavBar/>
      <AdminProductForm
        submitText="Create Product"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminProductCreate;
