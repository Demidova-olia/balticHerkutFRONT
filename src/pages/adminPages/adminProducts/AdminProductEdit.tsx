import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../../services/ProductService";
import AdminProductForm from "../../../components/Admin/AdminProductForm";
import { Product, ProductData } from "../../../types/product";
import { toast } from "react-toastify";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";

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
        images: [] 
      };

      await updateProduct(product._id, formDataObj, []);
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
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <AdminNavBar/>
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


