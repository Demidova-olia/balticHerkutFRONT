import React, { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { Subcategory } from '../../types/subcategory';
import { getCategories } from '../../services/CategoryService';
import { getSubcategories } from '../../services/SubcategoryService';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: FormData) => void;
  submitText: string;
}

const AdminProductForm: React.FC<ProductFormProps> = ({ initialData = {}, onSubmit, submitText }) => {
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
        console.error("Ошибка при получении категорий:", err);
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
        console.error("Ошибка при получении подкатегорий:", err);
      }
    };
    fetchSubcategories();
  }, []);

  // Фильтровать подкатегории по выбранной категории
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

  // Если выбрана подкатегория — автоматически установить её категорию
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Product name"
        value={formState.name}
        onChange={handleChange}
        required
        className="input"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formState.description}
        onChange={handleChange}
        required
        className="textarea"
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formState.price}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        type="number"
        name="stock"
        placeholder="Stock"
        value={formState.stock}
        onChange={handleChange}
        required
        className="input"
      />

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        required
        className="select"
      >
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>

      <select
        value={selectedSubcategory}
        onChange={handleSubcategoryChange}
        disabled={!filteredSubcategories.length}
        className="select"
      >
        <option value="">Select Subcategory</option>
        {filteredSubcategories.map(sub => (
          <option key={sub._id} value={sub._id}>{sub.name}</option>
        ))}
      </select>

      <input
        type="file"
        multiple
        onChange={handleImageChange}
        className="file-input"
      />

      <button type="submit" className="btn btn-primary">
        {submitText}
      </button>
    </form>
  );
};

export default AdminProductForm;
