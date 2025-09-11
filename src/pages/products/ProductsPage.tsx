// src/pages/productsPage/ProductsPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import NavBar from "../../components/NavBar/NavBar";
import SearchBar from "../../components/SearchBar/SearchBar";
import CategoryTree from "../../components/CategoryTree/CategoryTree";
import Loading from "../../components/Loading/Loading";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

import { Product } from "../../types/product";
import { CategoryWithSubcategories } from "../../types/category";
import { CategoryService } from "../../services/CategoryService";
import {
  getProducts,
  getProductsByCategory,
  getProductsByCategoryAndSubcategory,
  searchProducts,
} from "../../services/ProductService";

import styles from "../homePage/HomePage.module.css";

const DEBOUNCE_MS = 500;

const ProductsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(
    searchParams.get("subcategory") || null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** debounced значение поиска */
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchTerm]);

  /** грузим категории один раз */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const categoriesData = await CategoryService.getCategoriesWithSubcategories();
        if (!alive) return;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch {
        if (!alive) return;
        setCategories([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /** seq для защиты от «догоняющих» ответов */
  const fetchSeqRef = useRef(0);

  /** грузим товары при изменении фильтров/поиска (с дебаунсом) */
  useEffect(() => {
    const seq = ++fetchSeqRef.current;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        let productData: Product[] = [];

        if (selectedCategoryId && selectedSubcategoryId) {
          productData = await getProductsByCategoryAndSubcategory(
            selectedCategoryId,
            selectedSubcategoryId
          );
        } else if (selectedCategoryId) {
          productData = await getProductsByCategory(selectedCategoryId);
        } else if (debouncedSearch.trim()) {
          productData = await searchProducts(debouncedSearch.trim());
        } else {
          const productListData = await getProducts("", "", "", 1, 100);
          productData = productListData.products || [];
        }

        if (fetchSeqRef.current === seq) {
          setProducts(Array.isArray(productData) ? productData : []);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (fetchSeqRef.current === seq) {
          console.error("Error fetching products:", err);
          setProducts([]);
          setError(t("products.error", "An error occurred while loading products."));
          setLoading(false);
        }
      }
    })();
  }, [debouncedSearch, selectedCategoryId, selectedSubcategoryId, t]);

  /** синхронизируем URL c актуальными параметрами (после дебаунса) */
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (selectedSubcategoryId) params.subcategory = selectedSubcategoryId;

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategoryId, selectedSubcategoryId, setSearchParams]);

  /** хэндлеры UI */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategoryId = categoryId === selectedCategoryId ? null : categoryId;
    setSelectedCategoryId(newCategoryId);
    setSelectedSubcategoryId(null); // сбрасываем подкатегорию при смене категории
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    const newSubId = subcategoryId === selectedSubcategoryId ? null : subcategoryId;
    setSelectedSubcategoryId(newSubId);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSearchParams({}, { replace: true });
  };

  return (
    <>
      <NavBar />
      <div className={styles.pageContainer}>
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          isLoading={loading}
        />

        <div className={`${styles.categorySelectWrapper} px-4 mb-4`}>
          <button onClick={handleResetFilters} className={styles.ResetFilter}>
            {t("filters.reset", "Reset Filters")}
          </button>
        </div>

        <CategoryTree
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId || ""}
          onCategoryToggle={handleCategoryToggle}
          onSubcategorySelect={handleSubcategorySelect}
        />

        {loading ? (
          <Loading text={t("products.loading", "Loading products...")} className={styles.loadingText} />
        ) : error ? (
          <p className={styles.errorText}>{error}</p>
        ) : products.length === 0 ? (
          <p className={styles.errorText}>{t("products.none", "No products found.")}</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </>
  );
};

export default ProductsPage;

