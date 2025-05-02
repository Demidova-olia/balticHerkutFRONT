import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import { Product } from "../../types/product";
import { CategoryWithSubcategories } from "../../types/category";
import NavBar from "../../components/NavBar/NavBar";
import Loading from "../../components/Loading/Loading";
import CategoryTree from "../../components/CategoryTree/CategoryTree";
import SearchBar from "../../components/SearchBar/SearchBar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
// import "./HomePage.scss";

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          axiosInstance.get("/categories/with-subcategories"),
          axiosInstance.get(`/products?search=${searchTerm}`)
        ]);
        setCategories(categoriesRes.data);
        setProducts(productsRes.data.products || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchParams({ search: value, subcategory: selectedSubcategory });
  };

  const handleSubcategorySelect = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName);
    setSearchParams({ search: searchTerm, subcategory: subcategoryName });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubcategory =
      !selectedSubcategory ||
      (typeof product.subcategory === "object" && product.subcategory?.name === selectedSubcategory);
    return matchesSearch && matchesSubcategory;
  });

  return (
    <>
      <NavBar />
      <SearchBar value={searchTerm} onChange={handleSearchChange} />

      <div className="welcome-message">
        <h2>Welcome to our store!</h2>
        <p>Browse a variety of products and services.</p>
        <p>Select a category to start exploring!</p>
      </div>

      <CategoryTree
        categories={categories}
        openCategory={openCategory}
        selectedSubcategory={selectedSubcategory}
        onCategoryToggle={setOpenCategory}
        onSubcategorySelect={handleSubcategorySelect}
      />

      <h1>Our Top Products</h1>

      {loading ? (
        <Loading text="Loading products..." />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </>
  );
};

export default HomePage;

