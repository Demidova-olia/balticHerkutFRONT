import { useEffect, useState } from "react"
 import { useSearchParams } from "react-router-dom"
//  import NavBar from "../components/NavBar"
//  import ProductCard from "../components/ProductCard"
 import { useCart } from "../../hooks/useCart"
 import axiosInstance from "../../utils/axios"
//  import Loading from "../components/Loading/Loading"
 import "./HomePage.scss"
import { Product } from "../../types/product"
import { Category } from "../../types/category"
 
 
 const HomePage: React.FC = () => {
   // const { isAuthenticated } = useAuth()
   const { addToCart } = useCart()
   const [searchParams, setSearchParams] = useSearchParams()
 
   const [products, setProducts] = useState<Product[]>([])
   const [categories, setCategories] = useState<Category[]>([])
   const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
   const [selectedCategory, setSelectedCategory] = useState("")
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
 
   useEffect(() => {
     const fetchData = async () => {
       setLoading(true)
       try {
         const categoriesResponse = await axiosInstance.get("/categories")
         setCategories(categoriesResponse.data)
 
         const searchQuery = searchParams.get("search") || ""
         const response = await axiosInstance.get(`/products?search=${searchQuery}`)
         const productList = response.data.products || []
         setProducts(productList)
         setError(null)
       } catch (error) {
         setError("Nepavyko gauti prekių.")
         console.error(error)
       } finally {
         setLoading(false)
       }
     }
 
     fetchData()
   }, [searchParams])
 
   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const newSearchTerm = e.target.value
     setSearchTerm(newSearchTerm)
     setSearchParams({ search: newSearchTerm })
   }
 
   const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     setSelectedCategory(e.target.value)
   }
 
   const filteredProducts = products.filter((product) => {
     const matchesSearch =
       searchTerm === "" ||
       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description.toLowerCase().includes(searchTerm.toLowerCase())
 
     const matchesCategory = !selectedCategory || product.category?.name === selectedCategory
 
     return matchesSearch && matchesCategory
   })
 
   return (
     <>
       <div className="navigation-bar">
         <NavBar />
       </div>
 
       <div className="search-filters">
         <input
           type="text"
           placeholder="Ieškoti prekių..."
           value={searchTerm}
           onChange={handleSearchChange}
           className="search-input"
         />
 
         <select
           value={selectedCategory}
           onChange={handleCategoryChange}
           className="category-select"
         >
           <option value="">Visos kategorijos</option>
           {categories.map((category) => (
             <option key={category._id} value={category.name}>
               {category.name}
             </option>
           ))}
         </select>
       </div>
 
       <div className="welcome-message">
         <h2>Sveiki atvykę į mūsų svetainę!</h2>
         <p>Čia galite rasti įvairių prekių ir paslaugų.</p>
         <p>Pasirinkite kategoriją ir pradėkite naršyti!</p>
       </div>
 
       <h1>Mūsų TOP prekės!</h1>
 
       {loading ? (
         <Loading />
       ) : error ? (
         <p>{error}</p>
       ) : filteredProducts.length === 0 ? (
         <p>Prekių nerasta</p>
       ) : (
         <div className="product-grid">
           {filteredProducts.map((product) => (
             <ProductCard
               key={product._id}
               product={product}
               onAddToCart={() =>
                 addToCart({
                   id: product._id,
                   name: product.name,
                   price: product.price,
                   quantity: 1,
                   image: product.images?.[0],
                 })
               }
             />
           ))}
         </div>
       )}
 
       {/* {isAuthenticated && filteredProducts.length > 0 && (
         <div>
           <button className="confirm-button">Patvirtinti užsakymą</button>
         </div>
       )}
       )} */}
     </>
   )
 }
 
 export default HomePage