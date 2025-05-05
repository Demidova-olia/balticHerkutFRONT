import React, { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { Subcategory } from '../../types/subcategory';
import { getCategories } from '../../services/CategoryService';
import { getSubcategories } from '../../services/SubcategoryService';
import { Link, useNavigate } from 'react-router-dom';

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Product name"
          value={formState.name}
          onChange={handleChange}
          required
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Description"
          value={formState.description}
          onChange={handleChange}
          required
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
        <input
          id="price"
          type="number"
          name="price"
          placeholder="Price"
          value={formState.price}
          onChange={handleChange}
          required
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
        <input
          id="stock"
          type="number"
          name="stock"
          placeholder="Stock"
          value={formState.stock}
          onChange={handleChange}
          required
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          required
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">Subcategory</label>
        <select
          id="subcategory"
          value={selectedSubcategory}
          onChange={handleSubcategoryChange}
          disabled={!filteredSubcategories.length}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Subcategory</option>
          {filteredSubcategories.map(sub => (
            <option key={sub._id} value={sub._id}>{sub.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">Product Images</label>
        <input
          id="images"
          type="file"
          multiple
          onChange={handleImageChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {submitText}
      </button>
    </form>
    <div className="back-button">
        <button onClick={() => navigate(-1)} className="button back-btn">
          Go Back
        </button>
        <Link to="/" className="button main-menu-btn" style={{ marginLeft: 10 }}>
          Main Menu
        </Link>
      </div>
    </>
  );
};

export default AdminProductForm;
