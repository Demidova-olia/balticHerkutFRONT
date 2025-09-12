import { useEffect, useMemo, useState, useRef } from "react";
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

const SCROLL_COLLAPSE_Y = 220; 

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation("common");

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

  const [collapsed, setCollapsed] = useState(false);
  const hoverRef = useRef(false); 

  useEffect(() => {
    document.title = `${t("home.title", "Home")} — Baltic Herkut`;
  }, [t, i18n.language]);


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
      } catch {
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

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      const shouldCollapse = y > SCROLL_COLLAPSE_Y;
      setCollapsed(shouldCollapse);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadingText = useMemo(
    () => t("home.loadingProducts", "Loading products..."),
    [t]
  );

  return (
    <>
      <NavBar />

      <div className={`${styles.page} ${collapsed ? styles.isCollapsed : ""}`}>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarTitle}>
              {t("categories.title", "Categories")}
            </div>

            <CategoryTree
              categories={categories}
              selectedCategoryId={selectedCategoryId ?? null}
              selectedSubcategoryId={selectedSubcategoryId}
              onCategoryToggle={handleCategoryToggle}
              onSubcategorySelect={handleSubcategorySelect}
            />
          </div>
          <div className={styles.rail} aria-hidden />
        </aside>

        <main className={styles.main}>

          <section className={styles.hero}>
            <img
              src="/assets/Logo.jpg"
              alt={t("home.logoAlt", "Baltic Herkut")}
              className={styles.heroLogo}
              loading="eager"
              decoding="async"
            />
            <h1 className={styles.welcome}>
              {t("home.welcome", "Добро пожаловать в наш магазин!")}
            </h1>

            <div className={styles.carousel}>
              <ImageCarousel />
            </div>
            <p className={styles.heroHint}>
              {t("home.browse", "Смотрите наш ассортимент товаров и услуг.")}
            </p>


            <div />
          </section>

          <section className={`${styles.actions} ${styles.actionsSticky}`}>
            <SearchBar
              value={inputValue}
              onChange={handleSearchInputChange}
              debounceMs={400}
              onDebouncedChange={handleDebouncedSearch}
              isLoading={loading}
            />
            <button onClick={handleResetFilters} className={styles.resetBtn}>
              {t("home.resetFilters", "Сбросить фильтры")}
            </button>
          </section>

          <section className={styles.products}>
            <h2 className={styles.productsTitle}>
              {t("home.ourProducts", "Наши товары")}
            </h2>

            {loading ? (
              <Loading text={loadingText} className={styles.loadingText} />
            ) : error ? (
              <p className={styles.errorText}>{error}</p>
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

export default HomePage;



