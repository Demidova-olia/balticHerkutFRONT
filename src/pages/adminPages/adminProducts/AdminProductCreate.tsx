import React from "react";
import { useNavigate } from "react-router-dom";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { createProduct } from "../../../services/ProductService";
import { toast } from "react-toastify";
import { ProductData } from "../../../types/product";

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
        images: [] // если обрабатываешь изображения вручную
      };

      await createProduct(formDataObj, []);
      toast.success("✅ Продукт создан!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error("❌ Не удалось создать продукт.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Создать новый продукт</h2>
      <AdminProductForm
        submitText="Создать продукт"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminProductCreate;
