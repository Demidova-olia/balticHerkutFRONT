import React, { useEffect, useState } from "react";
import { Product } from "../../../types/product";
import { Link, useNavigate } from "react-router-dom";
import * as ProductService from "../../../services/ProductService";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProducts.module.css";

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
    const response = await ProductService.getProducts("", "", "", 1, 100);
    const data = response?.products || [];
    console.log("Fetched products:", data);
    setProducts(data);
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
    <div className={styles.adminProducts}>
      <h2>Manage Products</h2>
      <AdminNavBar />
      <button
        onClick={() => navigate("/admin/products/create")}
        className={styles.addProductBtn}
      >
        Add New Product
      </button>
      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>Images</th>
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
              <td data-label="Images">
                {product.images && product.images.length > 0 ? (
                  <div className={styles.imageGallery}>
                    {product.images.map((image, index) => {
                      const imgUrl = typeof image === "string" ? image : image.url;
                      console.log("Image URL:", imgUrl); // DEBUG
                      return (
                        <img
                          key={index}
                          src={imgUrl}
                          alt={`${product.name} image ${index + 1}`}
                          className={styles.productImage}
                        />
                      );
                    })}
                  </div>
                ) : (
                  "No Image"
                )}
              </td>
              <td data-label="Name">{product.name}</td>
              <td data-label="Category">{typeof product.category === "string" ? product.category : product.category?.name}</td>
              <td data-label="Subcategory">{typeof product.subcategory === "string" ? product.subcategory : product.subcategory?.name}</td>
              <td data-label="Price">€{product.price.toFixed(2)}</td>
              <td data-label="Stock">{product.stock}</td>
              <td data-label="Active">{product.isActive ? "Yes" : "No"}</td>
              <td data-label="Actions">
                <button
                  onClick={() => handleEdit(product._id)}
                  className={`${styles.button} ${styles.editBtn}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className={`${styles.button} ${styles.deleteBtn}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.backButton}>
        <button onClick={() => navigate(-1)} className={`${styles.button} ${styles.backBtn}`}>
          Go Back
        </button>
        <Link to="/" className={`${styles.button} ${styles.mainMenuBtn}`} style={{ marginLeft: 10 }}>
          Main Menu
        </Link>
      </div>
    </div>
  );
};

export default AdminProducts;
