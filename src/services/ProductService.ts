import axiosInstance from "../utils/axios";
interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  stock: number;
  images: File[];
}

const ProductService = {
  getProducts: async (page: number = 1, limit: number = 10) => {
    try {
      const response = await axiosInstance.get(`/products?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.log("🚀 ~ getProducts: ~ error:", error)
      throw new Error('Failed to fetch products');
    }
  },

  getProductById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.log("🚀 ~ getProductById: ~ error:", error)
      throw new Error('Failed to fetch product');
    }
  },

  getProductsByCategory: async (categoryName: string) => {
    try {
      const response = await axiosInstance.get(`/products/category/${categoryName}`);
      return response.data; 
    } catch (error) {
      console.log("🚀 ~ getProductsByCategory: ~ error:", error)
      throw new Error('Failed to fetch products by category');
    }
  },

  createProduct: async (productData: ProductData) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    formData.append('subcategory', productData.subcategory);
    formData.append('stock', productData.stock.toString());
    
    if (productData.images) {
    
      Array.from(productData.images).forEach((file) => {
        formData.append('images', file);
      });
    }

    try {
      const response = await axiosInstance.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.log("🚀 ~ createProduct: ~ error:", error)
      throw new Error('Failed to create product');
    }
  },

  updateProduct: async (id: string, productData: ProductData) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    formData.append('subcategory', productData.subcategory);
    formData.append('stock', productData.stock.toString());
    
    if (productData.images) {
      Array.from(productData.images).forEach((file) => {
        formData.append('images', file);
      });
    }

    try {
      const response = await axiosInstance.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.log("🚀 ~ updateProduct: ~ error:", error)
      throw new Error('Failed to update product');
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.log("🚀 ~ deleteProduct: ~ error:", error)
      throw new Error('Failed to delete product');
    }
  },

  searchProducts: async (query: string) => {
    try {
      const response = await axiosInstance.get(`/products/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.log("🚀 ~ searchProducts: ~ error:", error)
      throw new Error('Failed to search products');
    }
  },
};

export default ProductService;
