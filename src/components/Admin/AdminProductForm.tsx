import React, { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { Subcategory } from '../../types/subcategory';
import { getCategories } from '../../services/CategoryService';
import { getSubcategories } from '../../services/SubcategoryService';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminProductForm.module.css';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: FormData) => void;
  submitText: string;
}

const AdminProductForm: React.FC<ProductFormProps> = ({ initialData = {}, onSubmit, submitText }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(typeof initialData.category === 'string' ? initialData.category : initialData.category?._id || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(typeof initialData.subcategory === 'string' ? initialData.subcategory : initialData.subcategory?._id || '');
  const [images, setImages] = useState<File[]>([]);
  const [formState, setFormState] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    stock: initialData.stock || 0,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const data = await getSubcategories();
        setAllSubcategories(data);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allSubcategories.filter(sub =>
        typeof sub.parent === 'string'
          ? sub.parent === selectedCategory
          : sub.parent._id === selectedCategory
      );
      setFilteredSubcategories(filtered);
      setSelectedSubcategory('');
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, allSubcategories]);

  useEffect(() => {
    if (selectedSubcategory && !selectedCategory) {
      const sub = allSubcategories.find(sub => sub._id === selectedSubcategory);
      if (sub) {
        const parentId = typeof sub.parent === 'string' ? sub.parent : sub.parent._id;
        setSelectedCategory(parentId);
      }
    }
  }, [selectedSubcategory, allSubcategories, selectedCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = e.target.value;
    setSelectedSubcategory(subId);
    const sub = allSubcategories.find(s => s._id === subId);
    if (sub) {
      const parentId = typeof sub.parent === 'string' ? sub.parent : sub.parent._id;
      setSelectedCategory(parentId);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', formState.name);
    formData.append('description', formState.description);
    formData.append('price', formState.price.toString());
    formData.append('stock', formState.stock.toString());
    formData.append('category', selectedCategory);
    if (selectedSubcategory) {
      formData.append('subcategory', selectedSubcategory);
    }
    images.forEach(file => formData.append('images', file));
    onSubmit(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formField}>
          <label htmlFor="name" className={styles.label}>Product Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formState.name}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="description" className={styles.label}>Description</label>
          <textarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleChange}
            required
            className={styles.textarea}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="price" className={styles.label}>Price</label>
          <input
            id="price"
            type="number"
            name="price"
            value={formState.price}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="stock" className={styles.label}>Stock</label>
          <input
            id="stock"
            type="number"
            name="stock"
            value={formState.stock}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="category" className={styles.label}>Category</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
            className={styles.select}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label htmlFor="subcategory" className={styles.label}>Subcategory</label>
          <select
            id="subcategory"
            value={selectedSubcategory}
            onChange={handleSubcategoryChange}
            disabled={!filteredSubcategories.length}
            className={styles.select}
          >
            <option value="">Select Subcategory</option>
            {filteredSubcategories.map(sub => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label htmlFor="images" className={styles.label}>Product Images</label>
          <input
            id="images"
            type="file"
            multiple
            onChange={handleImageChange}
            className={styles.fileInput}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          {submitText}
        </button>
      </form>

      <div className={styles.backButtonContainer}>
        <button onClick={() => navigate(-1)} className={styles.button}>
          Go Back
        </button>
        <Link to="/" className={`${styles.button} ${styles.mainMenuBtn}`}>
          Main Menu
        </Link>
      </div>
    </>
  );
};

export default AdminProductForm;
