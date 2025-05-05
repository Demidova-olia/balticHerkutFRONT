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

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);  // Ensure it's always an array
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

        // Make sure products is always an array
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
        setProducts([]);  // Ensure empty array on error
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
    setSelectedSubcategoryId(""); // Reset subcategory when category changes

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
      <SearchBar value={searchTerm} onChange={handleSearchChange} />

      <div className="welcome-message">
        <h2>Welcome to our store!</h2>
        <p>Browse a variety of products and services.</p>
        <p>Select a category to start exploring!</p>
      </div>

      <div className="flex justify-between items-center px-4 mb-4">
        <h1 className="text-xl font-bold">Our Top Products</h1>
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded"
        >
          Reset Filters
        </button>
      </div>

      <CategoryTree
        categories={categories}
        selectedCategoryId={selectedCategoryId ?? null} // Handle null as undefined
        selectedSubcategoryId={selectedSubcategoryId}
        onCategoryToggle={handleCategoryToggle}
        onSubcategorySelect={handleSubcategorySelect}
      />

      {loading ? (
        <Loading text="Loading products..." />
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : (
        <ProductGrid 
          products={products} // Make sure this is always an array
          searchTerm={searchTerm}
          selectedCategoryId={selectedCategoryId || ""} // Handle null as empty string
          selectedSubcategoryId={selectedSubcategoryId}
        />
      )}
    </>
  );
};

export default HomePage;
