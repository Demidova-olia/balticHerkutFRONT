import { useEffect, useState } from "react";
import { Product } from "../../types/product";
import { getProducts } from "../../services/ProductService";
import NavBar from "../../components/NavBar/NavBar";
import SearchBar from "../../components/SearchBar/SearchBar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import styles from "../homePage/HomePage.module.css";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Загружаем все продукты без фильтров (для теста)
        const response = await getProducts("", "", "", 1, 100);
        console.log("Products fetched:", response);

        // Если response — массив продуктов
        if (Array.isArray(response)) {
          setProducts(response);
        } else if ("products" in response) {
          setProducts(response.products);
        } else {
          throw new Error("Unexpected response from getProducts");
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Ошибка загрузки продуктов");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Здесь можешь расширить логику поиска
  };

  return (
    <>
      <NavBar />
      <div className={styles.pageContainer}>
        <SearchBar value={searchTerm} onChange={handleSearchChange} />

        {loading ? (
          <p>Загрузка...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : products.length === 0 ? (
          <p>Продукты не найдены</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </>
  );
};

export default ProductsPage;
