import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductService from "../../services/ProductService";
import { getCategories } from "../../services/CategoryService";
import SubcategoryService from "../../services/SubcategoryService";
import { Category } from "../../types/category";
import { Subcategory } from "../../types/subcategory";
import { Product } from "../../types/product";

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Partial<Product>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [images, setImages] = useState<FileList | null>(null);

  const isEdit = Boolean(id);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      const data = await ProductService.getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error("Failed to load product", error);
    }
  }, [id]);

  const fetchCategories = useCallback(async () => {
    const data = await getCategories();
    setCategories(data);
  }, []);

  const fetchSubcategories = useCallback(async () => {
    const data = await SubcategoryService.getSubcategories();
    setSubcategories(data);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    if (id) fetchProduct();
  }, [id, fetchCategories, fetchSubcategories, fetchProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const categoryId = typeof product.category === "object" ? (product.category as Category)._id : product.category || "";
      const subcategoryId = typeof product.subcategory === "object" ? (product.subcategory as Subcategory)._id : product.subcategory || "";

      const imageFiles = images ? Array.from(images) : [];

      if (isEdit) {
        await ProductService.updateProduct(id!, {
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          category: categoryId,
          subcategory: subcategoryId,
          stock: product.stock || 0,
          images: imageFiles,
        });
      } else {
        await ProductService.createProduct({
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          category: categoryId,
          subcategory: subcategoryId,
          stock: product.stock || 0,
          images: imageFiles,
        });
      }

      navigate("/admin/products");
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  return (
    <div>
      <h2>{isEdit ? "Edit Product" : "Create Product"}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="name" placeholder="Name" value={product.name || ""} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={product.description || ""} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" value={product.price || 0} onChange={handleChange} required />
        <input type="number" name="stock" placeholder="Stock" value={product.stock || 0} onChange={handleChange} required />

        <select
          name="category"
          value={typeof product.category === "object" ? (product.category as Category)._id || "" : product.category || ""}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <select
          name="subcategory"
          value={typeof product.subcategory === "object" ? (product.subcategory as Subcategory)._id || "" : product.subcategory || ""}
          onChange={handleChange}
          required
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((sub) => (
            <option key={sub._id} value={sub._id}>{sub.name}</option>
          ))}
        </select>

        <input type="file" multiple accept="image/*" onChange={handleImageChange} />

        {isEdit && product.images && product.images.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
            {product.images.map((imgUrl, index) => (
              <div key={index} style={{ width: "100px" }}>
                <img src={imgUrl} alt={`Product ${index}`} style={{ width: "100%", height: "auto" }} />
              </div>
            ))}
          </div>
        )}

        <button type="submit">{isEdit ? "Update" : "Create"}</button>
        <button type="button" onClick={() => navigate("/admin/products")}>Cancel</button>
      </form>
    </div>
  );
};

export default ProductForm;
