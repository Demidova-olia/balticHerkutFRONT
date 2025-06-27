import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { Subcategory } from '../../types/subcategory';
import { getCategories } from '../../services/CategoryService';
import { getSubcategories } from '../../services/SubcategoryService';
import styles from './AdminProductForm.module.css';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: FormData) => void;
  onImageDelete?: (publicId: string) => void;
  submitText: string;
}

const AdminProductForm: React.FC<ProductFormProps> = ({
  initialData = {},
  onSubmit,
  onImageDelete,
  submitText,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeAllImages, setRemoveAllImages] = useState(false);

  const [formState, setFormState] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price?.toString() || '',
    stock: initialData.stock?.toString() || '',
  });

  // Initialize existing images filtering out strings (just URLs) to keep objects with url and public_id
  const [existingImages, setExistingImages] = useState(
    (initialData.images?.filter(
      (img): img is { url: string; public_id: string } => typeof img !== 'string'
    ) || [])
  );

  // Fetch categories and subcategories once on component mount
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    getSubcategories().then(setAllSubcategories).catch(console.error);
  }, []);

  // Initialize form fields and selected category/subcategory when initialData changes
  useEffect(() => {
    if (initialData && initialData.name) {
      setFormState({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        stock: initialData.stock?.toString() || '',
      });

      const catId =
        typeof initialData.category === 'string'
          ? initialData.category
          : initialData.category?._id || '';

      const subId =
        typeof initialData.subcategory === 'string'
          ? initialData.subcategory
          : initialData.subcategory?._id || '';

      setSelectedCategory(catId);
      setSelectedSubcategory(subId);
    }
  }, [initialData]);

  // Memoize filtered subcategories based on selected category to avoid unnecessary recalculations
  const filteredSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return allSubcategories.filter(sub =>
      typeof sub.parent === 'string'
        ? sub.parent === selectedCategory
        : sub.parent._id === selectedCategory
    );
  }, [selectedCategory, allSubcategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Handle new image uploads, only accept images and limit size to 5MB
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = Array.from(e.target.files).filter(file => {
        return file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
      });
      setImages(validFiles);
    }
  };

  // Delete an existing image by calling the provided onImageDelete prop, then update state
  const handleImageDelete = async (publicId: string) => {
    if (!onImageDelete) return;
    try {
      await onImageDelete(publicId);
      setExistingImages(prev => prev.filter(img => img.public_id !== publicId));
    } catch (err) {
      alert('Error deleting image.');
      console.error(err);
    }
  };

  // Form submission handler with basic validation and assembling FormData
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert('Please select a category.');
      return;
    }

    if (Number(formState.price) < 0 || Number(formState.stock) < 0) {
      alert('Price and stock cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', formState.name);
      formData.append('description', formState.description);
      formData.append('price', formState.price);
      formData.append('stock', formState.stock);
      formData.append('category', selectedCategory);
      if (selectedSubcategory) {
        formData.append('subcategory', selectedSubcategory);
      }

      images.forEach(img => formData.append('images', img));

      // Append flag to remove all images if applicable
      if (removeAllImages || (!images.length && !existingImages.length)) {
        formData.append('removeAllImages', 'true');
      }

      onSubmit(formData);

      // Reset form if creating a new product (no _id)
      if (!initialData._id) {
        setFormState({ name: '', description: '', price: '', stock: '' });
        setSelectedCategory('');
        setSelectedSubcategory('');
        setImages([]);
        setExistingImages([]);
        setRemoveAllImages(false);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formField}>
        <label className={styles.label}>Name</label>
        <input
          type="text"
          name="name"
          value={formState.name}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>Description</label>
        <textarea
          name="description"
          value={formState.description}
          onChange={handleChange}
          required
          className={styles.textarea}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>Price</label>
        <input
          type="number"
          name="price"
          value={formState.price}
          onChange={handleChange}
          required
          className={styles.input}
          min={0}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>Stock</label>
        <input
          type="number"
          name="stock"
          value={formState.stock}
          onChange={handleChange}
          required
          className={styles.input}
          min={0}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>Category</label>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          required
          className={styles.select}
        >
          <option value="">Select</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>Subcategory</label>
        <select
          value={selectedSubcategory}
          onChange={e => setSelectedSubcategory(e.target.value)}
          disabled={!filteredSubcategories.length}
          className={styles.select}
        >
          <option value="">Select</option>
          {filteredSubcategories.map(sub => (
            <option key={sub._id} value={sub._id}>{sub.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label className={styles.label}>Upload New Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className={styles.fileInput}
        />
      </div>

      {images.length > 0 && (
        <div className={styles.imagePreview}>
          <label className={styles.label}>New Images Preview:</label>
          <div className={styles.imageGrid}>
            {images.map((img) => (
              <img
                key={`${img.name}-${img.lastModified}`}
                src={URL.createObjectURL(img)}
                alt="preview"
              />
            ))}
          </div>
        </div>
      )}

      {existingImages.length > 0 && (
        <div className={styles.imagePreview}>
          <label className={styles.label}>Current Images:</label>
          <div className={styles.imageGrid}>
            {existingImages.map((img) => (
              <div key={img.public_id} className={styles.imageItem}>
                <img src={img.url} alt="Existing" />
                <button
                  type="button"
                  onClick={() => handleImageDelete(img.public_id)}
                  className={styles.button}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {existingImages.length > 0 && (
        <div className={styles.formField}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={removeAllImages}
              onChange={e => setRemoveAllImages(e.target.checked)}
            />
            Remove all images
          </label>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? 'Submitting...' : submitText}
      </button>
    </form>
  );
};

export default AdminProductForm;
