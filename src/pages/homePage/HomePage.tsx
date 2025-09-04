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
import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";

interface ProductResponse {
  products: Product[];
  totalPages: number;
  totalProducts: number;
}

function isProductResponse(obj: unknown): obj is ProductResponse {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "products" in obj
  ) {
    const maybeProducts = (obj as { products?: unknown }).products;
    return Array.isArray(maybeProducts);
  }
  return false;
}

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

        let productResponse: unknown;

        if (selectedCategoryId && selectedSubcategoryId) {
          productResponse = await getProductsByCategoryAndSubcategory(selectedCategoryId, selectedSubcategoryId);
        } else if (searchTerm) {
          productResponse = await searchProducts(searchTerm);
        } else {
          productResponse = await getProducts(
            searchTerm,
            selectedCategoryId ?? "",
            selectedSubcategoryId ?? "",
            1,
            100
          );
        }

        if (Array.isArray(productResponse)) {
          setProducts(productResponse);
        } else if (isProductResponse(productResponse)) {
          setProducts(productResponse.products);
        } else {
          setProducts([]);
        }

        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
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
    <>
      <NavBar />
    
      <div className={styles.pageContainer}>
        
        <div className={styles.welcomeMessage}>
          <h1>Baltic Herkut</h1>
          <h2>Welcome to our store!</h2>
          <ImageCarousel/>
          <p>Browse a variety of products and services.</p>
        </div>
        <SearchBar value={searchTerm} onChange={handleSearchChange} />

        <div className={styles.welcomeMessage}>
          <p>Select a category to start exploring!</p>
        </div>

        <div className={`${styles.categorySelectWrapper} px-4 mb-4`}>
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

        <div>
          <h2 className={styles.categorySelectTitle}>Our Products</h2>
        </div>

        {loading ? (
          <Loading text="Loading products..." className={styles.loadingText} />
        ) : error ? (
          <p className={styles.errorText}>{error}</p>
        ) : (
          <ProductGrid 
            products={products}
          />
        )}
      </div>
    </>
  );
};

export default HomePage;
