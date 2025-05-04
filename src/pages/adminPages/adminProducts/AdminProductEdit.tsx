import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../../services/ProductService";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { Product, ProductData } from "../../../types/product";
import { toast } from "react-toastify";

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
          setLoading(false);
        } catch {
          setError("Failed to fetch product.");
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    if (!product) return;

    try {
      const formDataObj: ProductData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        subcategory: formData.get("subcategory") as string,
        stock: parseInt(formData.get("stock") as string),
        images: [] // можно дополнить обработкой изображений
      };

      await updateProduct(product._id, formDataObj, []);
      toast.success("✅ Продукт обновлён!");
      navigate("/admin/products"); // путь на страницу списка товаров
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("❌ Не удалось обновить продукт.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Редактировать продукт</h2>
      {product && (
        <AdminProductForm
          initialData={product}
          submitText="Обновить продукт"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AdminProductEdit;

