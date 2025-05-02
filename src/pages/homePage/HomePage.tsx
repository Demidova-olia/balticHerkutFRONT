import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import axiosInstance from "../../utils/axios";
import "./HomePage.scss";

import { Product } from "../../types/product";
import { Category } from "../../types/category";

import NavBar from "../../components/NavBar/NavBar";
import Loading from "../../components/Loading/Loading";
import ProductCard from "../../components/ProductCard/ProductCard";

const HomePage: React.FC = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesResponse = await axiosInstance.get("/categories");
        setCategories(categoriesResponse.data);

        const searchQuery = searchParams.get("search") || "";
        const response = await axiosInstance.get(`/products?search=${searchQuery}`);
        const productList = response.data.products || [];
        setProducts(productList);
        setError(null);
      } catch (error) {
        setError("Failed to fetch products.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setSearchParams({ search: newSearchTerm });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesCategory =
      !selectedCategory ||
      (typeof product.category === "object" && product.category?.name === selectedCategory);
  
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="navigation-bar">
        <NavBar />
      </div>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="welcome-message">
        <h2>Welcome to our store!</h2>
        <p>Browse a variety of products and services.</p>
        <p>Select a category to start exploring!</p>
      </div>

      <h1>Our Top Products</h1>

      {loading ? (
        <Loading text="Loading products..." />
      ) : error ? (
        <p>{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={() =>
                addToCart({
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  image: product.images?.[0],
                })
              }
            />
          ))}
        </div>
      )}
    </>
  );
};

export default HomePage;
