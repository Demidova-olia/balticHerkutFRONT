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

const AdminProductForm: React.FC<ProductFormProps> = ({
  initialData = {},
  onSubmit,
  submitText,
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeAllImages, setRemoveAllImages] = useState(false);

  const [formState, setFormState] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
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
        console.error('Error fetching subcategories:', err);
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
    if (initialData && initialData.name) {
      setFormState({
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        stock: initialData.stock?.toString() || '',
      });

      const categoryId =
        typeof initialData.category === 'string'
          ? initialData.category
          : initialData.category?._id || '';

      const subcategoryId =
        typeof initialData.subcategory === 'string'
          ? initialData.subcategory
          : initialData.subcategory?._id || '';

      setSelectedCategory(categoryId);
      setSelectedSubcategory(subcategoryId);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validImages: File[] = [];
      Array.from(e.target.files).forEach(file => {
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not a valid image.`);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 5MB size limit.`);
          return;
        }
        validImages.push(file);
      });
      setImages(validImages);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert('Please select a category.');
      return;
    }

    if (!initialData._id && images.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', formState.name);
      formData.append('description', formState.description);
      formData.append('price', parseFloat(formState.price).toString());
      formData.append('stock', parseInt(formState.stock).toString());
      formData.append('category', selectedCategory);

      if (selectedSubcategory) {
        formData.append('subcategory', selectedSubcategory);
      }

      images.forEach(file => {
        formData.append('images', file);
      });

      formData.append('removeAllImages', removeAllImages.toString());

      onSubmit(formData);

      if (!initialData._id) {
        setFormState({ name: '', description: '', price: '', stock: '' });
        setSelectedCategory('');
        setSelectedSubcategory('');
        setImages([]);
        setRemoveAllImages(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
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
            onChange={e => setSelectedCategory(e.target.value)}
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
          <label htmlFor="images" className={styles.label}>Upload New Images</label>
          <input
            id="images"
            type="file"
            multiple
            onChange={handleImageChange}
            className={styles.fileInput}
          />
        </div>

        {images.length > 0 && (
          <div className={styles.imagePreview}>
            <label className={styles.label}>New Images Preview:</label>
            <div className={styles.imageGrid}>
              {images.map((image, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${idx + 1}`}
                  className={styles.previewImage}
                />
              ))}
            </div>
          </div>
        )}

        {initialData.images && initialData.images.length > 0 && (
          <div className={styles.imagePreview}>
            <label className={styles.label}>Current Images:</label>
            <div className={styles.imageGrid}>
              {initialData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={typeof img === 'string' ? img : img.url}
                  alt={`Product image ${idx + 1}`}
                  className={styles.previewImage}
                />
              ))}
            </div>
          </div>
        )}

        {initialData.images && initialData.images.length > 0 && (
          <div className={styles.formField}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={removeAllImages}
                onChange={e => setRemoveAllImages(e.target.checked)}
              />
              Remove all current images
            </label>
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : submitText}
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
