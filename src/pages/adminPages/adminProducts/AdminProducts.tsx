import React, { useEffect, useState } from "react";
import { Product } from "../../../types/product";
import ProductService from "../../../services/ProductService";
import { Link, useNavigate } from "react-router-dom";

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await ProductService.getProducts();
      setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ProductService.deleteProduct(id);
        setProducts(prev => prev.filter(product => product._id !== id));
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product.");
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/products/edit/${id}`);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-products">
      <h2>Manage Products</h2>
      <button onClick={() => navigate("/admin/products/create")}>
        Add New Product
      </button>
      <table>
        <thead>
          <tr>
            <th>Image</th> 
            <th>Name</th>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
                <td>
                {product.images && product.images.length > 0 ? (
                    <img
                    src={product.images[0]}
                    alt={product.name}
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                ) : (
                    "No Image"
                )}
                </td>
              <td>{product.name}</td>
              <td>{typeof product.category === "string" ? product.category : product.category?.name}</td>
              <td>{typeof product.subcategory === "string" ? product.subcategory : product.subcategory?.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.stock}</td>
              <td>{product.isActive ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => handleEdit(product._id)}>Edit</button>
                <button onClick={() => handleDelete(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="back-button">
        <button onClick={() => navigate(-1)} className="button">
          Go Back
        </button>
        <Link to="/" className="button" style={{ marginLeft: 10 }}>
          Main Menu
        </Link>
      </div>
    </div>
  );
};

export default AdminProducts;
