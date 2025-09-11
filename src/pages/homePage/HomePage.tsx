// src/pages/homePage/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import NavBar from "../../components/NavBar/NavBar";
import SearchBar from "../../components/SearchBar/SearchBar";
import CategoryTree from "../../components/CategoryTree/CategoryTree";
import Loading from "../../components/Loading/Loading";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";

import { Product } from "../../types/product";
import { CategoryWithSubcategories } from "../../types/category";
import { CategoryService } from "../../services/CategoryService";
import {
  getProducts,
  getProductsByCategoryAndSubcategory,
  searchProducts,
} from "../../services/ProductService";

import styles from "./HomePage.module.css";

interface ProductResponse {
  products: Product[];
  totalPages: number;
  totalProducts: number;
}

function isProductResponse(obj: unknown): obj is ProductResponse {
  return !!obj && typeof obj === "object" && Array.isArray((obj as any).products);
}

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation("common");

  // Отдельно храним "ввод" и "реальный запрос" (после дебаунса)
  const initialSearch = searchParams.get("search") || "";
  const initialCat = searchParams.get("category") || null;
  const initialSub = searchParams.get("subcategory") || "";

  const [inputValue, setInputValue] = useState(initialSearch);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCat);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(initialSub);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Заголовок страницы по языку
  useEffect(() => {
    document.title = `${t("home.title", "Home")} — Baltic Herkut`;
  }, [t, i18n.language]);

  // Загрузка категорий один раз
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const categoriesData = await CategoryService.getCategoriesWithSubcategories();
        if (!cancelled) setCategories(categoriesData);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Загрузка продуктов при изменении фильтров/поиска
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        let productResponse: unknown;

        if (selectedCategoryId && selectedSubcategoryId) {
          productResponse = await getProductsByCategoryAndSubcategory(
            selectedCategoryId,
            selectedSubcategoryId
          );
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

        if (cancelled) return;

        if (Array.isArray(productResponse)) {
          setProducts(productResponse);
        } else if (isProductResponse(productResponse)) {
          setProducts(productResponse.products);
        } else {
          setProducts([]);
        }
        setError(null);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(t("errors.unknown", "Unknown error"));
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [searchTerm, selectedCategoryId, selectedSubcategoryId, t]);

  // Обновление ввода — только локально
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Дебаунс завершился — фиксируем searchTerm и URL
  const handleDebouncedSearch = (value: string) => {
    setSearchTerm(value);

    const params: Record<string, string> = {};
    if (value) params.search = value;
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (selectedSubcategoryId) params.subcategory = selectedSubcategoryId;
    setSearchParams(params);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategoryId = categoryId === selectedCategoryId ? null : categoryId;
    setSelectedCategoryId(newCategoryId);
    setSelectedSubcategoryId("");

    // Обновим URL, но не трогаем inputValue напрямую
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (newCategoryId) params.category = newCategoryId;
    setSearchParams(params);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    const newSubcategoryId = subcategoryId === selectedSubcategoryId ? "" : subcategoryId;
    setSelectedSubcategoryId(newSubcategoryId);

    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (newSubcategoryId) params.subcategory = newSubcategoryId;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setInputValue("");
    setSearchTerm("");
    setSelectedCategoryId(null);
    setSelectedSubcategoryId("");
    setSearchParams({});
  };

  const loadingText = useMemo(
    () => t("home.loadingProducts", "Loading products..."),
    [t]
  );

  return (
    <>
      <NavBar />
      <div className={styles.pageContainer}>
        <div className={styles.welcomeMessage}>
          <div className={styles.logoWrap}>
            <img
              src="/assets/Logo.jpg"
              alt={t("home.logoAlt", "Baltic Herkut")}
              className={styles.logoImage}
              loading="eager"
              decoding="async"
            />
          </div>

          <h2>{t("home.welcome", "Welcome to our store!")}</h2>

          <div className={styles.carouselSpacer}>
            <ImageCarousel />
          </div>

          <p>{t("home.browse", "Browse a variety of products and services.")}</p>
        </div>

        <div className={styles.searchBarContainer}>
          <SearchBar
            value={inputValue}
            onChange={handleSearchInputChange}
            debounceMs={400}
            onDebouncedChange={handleDebouncedSearch}
            isLoading={loading}
          />
        </div>

        <div className={styles.welcomeMessage}>
          <p>{t("home.selectCategory", "Select a category to start exploring!")}</p>
        </div>

        <div className={`${styles.categorySelectWrapper} px-4 mb-4`}>
          <button onClick={handleResetFilters} className={styles.ResetFilter}>
            {t("home.resetFilters", "Reset Filters")}
          </button>
        </div>

        <CategoryTree
          categories={categories}
          selectedCategoryId={selectedCategoryId ?? null}
          selectedSubcategoryId={selectedSubcategoryId}
          onCategoryToggle={handleCategoryToggle}
          onSubcategorySelect={handleSubcategorySelect}
        />

        <h2 className={styles.categorySelectTitle}>{t("home.ourProducts", "Our Products")}</h2>

        {loading ? (
          <Loading text={loadingText} className={styles.loadingText} />
        ) : error ? (
          <p className={styles.errorText}>{error}</p>
        ) : (
          <div className={styles.productGridWrapper}>
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
