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

  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("search") || ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(
    searchParams.get("subcategory") || null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ——— поведение выдвижной панели (как на главной)
  const [collapsed, setCollapsed] = useState(false);
  const hoverRef = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      if (hoverRef.current) return;
      setCollapsed(window.scrollY > 280);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ——— дебаунс поиска
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // ——— загрузка категорий
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

  // ——— защита от «догоняющих» запросов
  const fetchSeqRef = useRef(0);

  // ——— загрузка товаров при смене фильтров/поиска
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
          setError(t("errors.unknown", "Unknown error"));
          setLoading(false);
        }
      }
    })();
  }, [debouncedSearch, selectedCategoryId, selectedSubcategoryId, t]);

  // ——— синхронизация URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (selectedSubcategoryId) params.subcategory = selectedSubcategoryId;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategoryId, selectedSubcategoryId, setSearchParams]);

  // ——— обработчики
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategoryId = categoryId === selectedCategoryId ? null : categoryId;
    setSelectedCategoryId(newCategoryId);
    setSelectedSubcategoryId(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    const newSubId =
      subcategoryId === selectedSubcategoryId ? null : subcategoryId;
    setSelectedSubcategoryId(newSubId);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSearchParams({}, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <NavBar />

      {/* Вся страница с учётом боковой панели */}
      <div className={`${styles.page} ${collapsed ? styles.isCollapsed : ""}`}>
        {/* Левая фиксированная панель категорий */}
        <aside
          className={styles.sidebar}
          onMouseEnter={() => (hoverRef.current = true)}
          onMouseLeave={() => (hoverRef.current = false)}
        >
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarTitle}>
              {t("categories.title", "Categories")}
            </div>

            <CategoryTree
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              selectedSubcategoryId={selectedSubcategoryId}
              onCategoryToggle={handleCategoryToggle}
              onSubcategorySelect={handleSubcategorySelect}
            />
          </div>

          {/* узкая рейка когда панель свёрнута */}
          <div className={styles.rail} aria-hidden />
        </aside>

        {/* Правая колонка: поиск и товары */}
        <main className={styles.main}>
          <section className={styles.actions}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              debounceMs={DEBOUNCE_MS}
              onDebouncedChange={setDebouncedSearch}
              isLoading={loading}
            />
            <button onClick={handleResetFilters} className={styles.resetBtn}>
              {t("home.resetFilters", "Reset Filters")}
            </button>
          </section>

          <section className={styles.products}>
            <h2 className={styles.productsTitle}>
              {t("home.ourProducts", "Our Products")}
            </h2>

            {loading ? (
              <Loading
                text={t("loading.default", "Loading...")}
                className={styles.loadingText}
              />
            ) : error ? (
              <p className={styles.errorText}>{error}</p>
            ) : products.length === 0 ? (
              <p className={styles.errorText}>
                {t("products.none", "No products found.")}
              </p>
            ) : (
              <div className={styles.productGridWrapper}>
                <ProductGrid products={products} />
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default ProductsPage;
