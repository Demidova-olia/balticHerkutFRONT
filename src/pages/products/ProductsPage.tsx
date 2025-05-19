import { useEffect, useState } from "react";
import { Product } from "../../types/product";
import { useSearchParams } from "react-router";
import { CategoryWithSubcategories } from "../../types/category";
import { CategoryService } from "../../services/CategoryService";
import {
  getProducts,
  getProductsByCategory,
  getProductsByCategoryAndSubcategory,
  searchProducts,
} from "../../services/ProductService";
import NavBar from "../../components/NavBar/NavBar";
import SearchBar from "../../components/SearchBar/SearchBar";
import CategoryTree from "../../components/CategoryTree/CategoryTree";
import Loading from "../../components/Loading/Loading";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import styles from "../homePage/HomePage.module.css";

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(searchParams.get("category") || null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(searchParams.get("subcategory") || null);
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
      console.log("🚀 ~ fetchData ~ selectedSubcategoryId:", selectedSubcategoryId)
      console.log("🚀 ~ fetchData ~ selectedCategoryId:", selectedCategoryId)
    } else if (selectedCategoryId) {
      productData = await getProductsByCategory(selectedCategoryId);
      console.log("🚀 ~ fetchData ~ selectedCategoryId:", selectedCategoryId)
    } else if (searchTerm) {
      productData = await searchProducts(searchTerm);
      console.log("🚀 ~ fetchData ~ searchTerm:", searchTerm)
    } else {
      const response = await getProducts("", "", "", 1, 100);
      productData = response.products;
    }

    console.log("Loaded products:", productData);
    setProducts(productData);
    console.log("Final productData:", productData);
    setError(null);
  } catch (err) {
    console.error("Error fetching products:", err);
    setError("An error occurred while loading products.");
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
        <SearchBar value={searchTerm} onChange={handleSearchChange} />

        <div className={`${styles.categorySelectWrapper} px-4 mb-4`}>
          <button onClick={handleResetFilters} className={styles.ResetFilter}>
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
          <ProductGrid products={products} />
        )}
      </div>
    </>
  );
};

export default ProductsPage;
