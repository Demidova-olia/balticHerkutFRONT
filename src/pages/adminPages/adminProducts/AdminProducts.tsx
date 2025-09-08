import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as ProductService from "../../../services/ProductService";
import { Product } from "../../../types/product";
import { AdminNavBar } from "../../../components/Admin/AdminNavBar";
import styles from "./AdminProducts.module.css";
import BottomNav from "../../../components/Admin/BottomNav";

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductService.getProducts("", "", "", 1, 100);
      const data = response?.products || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await ProductService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError("Failed to delete product.");
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/products/edit/${id}`);
  };

  if (loading) return <p className={styles.loading}>Loading products...</p>;

  return (
    <div className={styles.adminProducts}>
      <h2 className={styles.heading}>Manage Products</h2>
      <AdminNavBar />

      {error && (
        <div className={styles.error}>
          {error}{" "}
          <button className={styles.retryBtn} onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.topBar}>
        <button
          onClick={() => navigate("/admin/products/create")}
          className={styles.addProductBtn}
        >
          Add New Product
        </button>
      </div>

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
          {products
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((product) => {
              const price =
                typeof product.price === "number" && isFinite(product.price)
                  ? product.price.toFixed(2)
                  : "0.00";

              return (
                <tr key={product._id}>
                  <td data-label="Images">
                    {product.images && product.images.length > 0 ? (
                      <div className={styles.imageGallery}>
                        {product.images.map((image, index) => {
                          const imgUrl =
                            typeof image === "string" ? image : image?.url || "/images/no-image.png";
                          return (
                            <img
                              key={`${product._id}-${index}`}
                              src={imgUrl}
                              alt={`${product.name} ${index + 1}`}
                              className={styles.productImage}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      "No Image"
                    )}
                  </td>

                  <td data-label="Name">{product.name}</td>

                  <td data-label="Category">
                    {typeof product.category === "string"
                      ? product.category
                      : product.category?.name || "—"}
                  </td>

                  <td data-label="Subcategory">
                    {typeof product.subcategory === "string"
                      ? product.subcategory
                      : product.subcategory?.name || "—"}
                  </td>

                  <td data-label="Price">€{price}</td>

                  <td data-label="Stock">{product.stock ?? 0}</td>

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
              );
            })}
        </tbody>
      </table>

      <BottomNav />
    </div>
  );
};

export default AdminProducts;
