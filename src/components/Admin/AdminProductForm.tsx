import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as ProductService from "../../services/ProductService";
import { getCategories } from "../../services/CategoryService";
import SubcategoryService from "../../services/SubcategoryService";
import { Category } from "../../types/category";
import { Subcategory } from "../../types/subcategory";
import { Product } from "../../types/product";

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    try {
      const data = await SubcategoryService.getSubcategories();
      setSubcategories(data);
    } catch (error) {
      console.error("Failed to load subcategories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    if (isEdit) fetchProduct();
  }, [isEdit, fetchCategories, fetchSubcategories, fetchProduct]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

  const resetForm = () => {
    setProduct({});
    setImages(null);
    navigate("/admin/products");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !product.name ||
      !product.description ||
      !product.price ||
      !product.category ||
      !product.subcategory ||
      product.stock === undefined
    ) {
      alert("Please fill out all required fields");
      return;
    }

    const productData = {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: typeof product.category === "string"
        ? product.category
        : (product.category as Category)._id,
      subcategory: typeof product.subcategory === "string"
        ? product.subcategory
        : (product.subcategory as Subcategory)._id,
      stock: Number(product.stock),
      images: [] // not used directly here, handled via files param
    };

    const fileArray: File[] = images ? Array.from(images) : [];

    try {
      if (isEdit && id) {
        await ProductService.updateProduct(id, productData, fileArray);
      } else {
        await ProductService.createProduct(productData, fileArray);
      }

      alert("Product saved successfully");
      resetForm();
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save product");
    }
  };

  return (
    <div>
      <h2>{isEdit ? "Edit Product" : "Create Product"}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="name"
          placeholder="Name"
          value={product.name || ""}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={product.description || ""}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={product.price || ""}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={product.stock || ""}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={
            typeof product.category === "object"
              ? (product.category as Category)._id || ""
              : product.category || ""
          }
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="subcategory"
          value={
            typeof product.subcategory === "object"
              ? (product.subcategory as Subcategory)._id || ""
              : product.subcategory || ""
          }
          onChange={handleChange}
          required
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>

        <input type="file" multiple accept="image/*" onChange={handleImageChange} />

        {isEdit && Array.isArray(product.images) && product.images.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
            {product.images.map((imgUrl, index) => (
              <div key={index} style={{ width: "100px" }}>
                <img src={imgUrl} alt={`Product ${index}`} style={{ width: "100%" }} />
              </div>
            ))}
          </div>
        )}

        <button type="submit">{isEdit ? "Update" : "Create"}</button>
        <button type="button" onClick={() => navigate("/admin/products")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
