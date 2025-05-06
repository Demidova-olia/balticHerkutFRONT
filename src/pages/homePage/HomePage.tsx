import { useEffect, useState } from "react";
import { Product } from "../../types/product";
import { useSearchParams } from "react-router";
import { CategoryWithSubcategories } from "../../types/category";
import { CategoryService } from "../../services/CategoryService";
import { getProducts, getProductsByCategoryAndSubcategory, searchProducts } from "../../services/ProductService";
import NavBar from "../../components/NavBar/NavBar";
import SearchBar from "../../components/SearchBar/SearchBar";
import CategoryTree from "../../components/CategoryTree/CategoryTree";
import Loading from "../../components/Loading/Loading";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import styles from './HomePage.module.css'; 
const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]); 
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(searchParams.get("category") || null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(searchParams.get("subcategory") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesData = await CategoryService.getCategoriesWithSubcategories();
        setCategories(categoriesData);

        let productData: Product[] = [];

        if (selectedCategoryId && selectedSubcategoryId) {
          productData = await getProductsByCategoryAndSubcategory(selectedCategoryId, selectedSubcategoryId);
        } else if (searchTerm) {
          productData = await searchProducts(searchTerm);
        } else {
          productData = await getProducts(searchTerm, selectedCategoryId ?? undefined, selectedSubcategoryId, 1, 100);
        }

        setProducts(Array.isArray(productData) ? productData : []);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error(err);
        } else {
          setError("Unknown error occurred");
          console.error("Unknown error", err);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedCategoryId, selectedSubcategoryId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    const params: Record<string, string> = { search: value };
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (selectedSubcategoryId) params.subcategory = selectedSubcategoryId;
    setSearchParams(params);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategoryId = categoryId === selectedCategoryId ? null : categoryId;
    setSelectedCategoryId(newCategoryId);
    setSelectedSubcategoryId("");

    const params: Record<string, string> = { search: searchTerm };
    if (newCategoryId) params.category = newCategoryId;
    setSearchParams(params);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    const newSubcategoryId = subcategoryId === selectedSubcategoryId ? "" : subcategoryId;
    setSelectedSubcategoryId(newSubcategoryId);

    const params: Record<string, string> = { search: searchTerm };
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (newSubcategoryId) params.subcategory = newSubcategoryId;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId(null);
    setSelectedSubcategoryId("");
    setSearchParams({});
  };

  return (
    <div className={styles.pageContainer}>
      <NavBar />
      <div className={styles.welcomeMessage}>
        <h1>Baltic Herkut</h1>
        <h2>Welcome to our store!</h2>
        <p>Browse a variety of products and services.</p>
      </div>
      <SearchBar value={searchTerm} onChange={handleSearchChange} />

      <div className={styles.welcomeMessage}>
        <p>Select a category to start exploring!</p>
      </div>

      <div className={`${styles.categorySelectWrapper} px-4 mb-4`}>
        <h2 className={styles.categorySelectTitle}>Our Products</h2>
        <button
          onClick={handleResetFilters}
          className={styles.ResetFilter}
        >
          Reset Filters
        </button>
      </div>

      <CategoryTree
        categories={categories}
        selectedCategoryId={selectedCategoryId ?? null}
        selectedSubcategoryId={selectedSubcategoryId}
        onCategoryToggle={handleCategoryToggle}
        onSubcategorySelect={handleSubcategorySelect}
    
      />

      {loading ? (
        <Loading text="Loading products..." className={styles.loadingText} />
      ) : error ? (
        <p className={styles.errorText}>{error}</p>
      ) : (
        <ProductGrid 
          products={products}
          searchTerm={searchTerm}
          selectedCategoryId={selectedCategoryId || ""}
          selectedSubcategoryId={selectedSubcategoryId}
          
        />
      )}
    </div>
  );
};

export default HomePage;
