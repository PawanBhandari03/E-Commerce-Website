import axios from "../axios";
import { useState, useEffect, createContext } from "react";

const MOCK_PRODUCTS = [
  {
    id: 991,
    name: "MacBook Pro M3",
    brand: "Apple",
    description: "Supercharged by M3 Pro chip. Liquid Retina XDR display, 18GB Unified Memory, 512GB SSD.",
    price: 1999.0,
    category: "Laptop",
    stockQuantity: 10,
    releaseDate: "2023-11-07",
    productAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop"
  },
  {
    id: 992,
    name: "Sony WH-1000XM5",
    brand: "Sony",
    description: "Industry leading noise-canceling headphones with auto NC optimizer, crystal clear hands-free calling, and 30-hour battery life.",
    price: 348.0,
    category: "Headphone",
    stockQuantity: 15,
    releaseDate: "2022-05-20",
    productAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop"
  },
  {
    id: 993,
    name: "iPhone 15 Pro",
    brand: "Apple",
    description: "Forged in titanium, featuring the groundbreaking A17 Pro chip, a customizable Action button, and a powerful camera system.",
    price: 999.0,
    category: "Mobile",
    stockQuantity: 8,
    releaseDate: "2023-09-22",
    productAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop"
  },
  {
    id: 994,
    name: "Smart Watch Series 9",
    brand: "Apple",
    description: "Smarter, brighter, mightier. Double tap gesture support, temperature sensing, blood oxygen tracking, and watchOS 10.",
    price: 399.0,
    category: "Electronics",
    stockQuantity: 20,
    releaseDate: "2023-09-22",
    productAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop"
  },
  {
    id: 995,
    name: "Mechanical Gaming Keyboard",
    brand: "Keychron",
    description: "Hot-swappable tactile switches, double-shot PBT keycaps, customizable RGB backlighting, and dual Bluetooth/Wired connectivity.",
    price: 119.0,
    category: "Electronics",
    stockQuantity: 12,
    releaseDate: "2023-02-15",
    productAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop"
  },
  {
    id: 996,
    name: "Designer Denim Jacket",
    brand: "Levi's",
    description: "Classic trucker style denim jacket crafted with premium heavyweight cotton, button closures, and two chest pockets.",
    price: 89.0,
    category: "Fashion",
    stockQuantity: 25,
    releaseDate: "2021-08-10",
    productAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop"
  }
];

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData:() =>{},
  updateStockQuantity: (productId, newQuantity) =>{}
  
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);


  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    if (existingProductIndex !== -1) {
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = (productId) => {
    console.log("productID",productId)
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    console.log("CART",cart)
  };

  const refreshData = async () => {
    try {
      const response = await axios.get("/products");
      setData(response.data);
      setIsError("");
    } catch (error) {
      console.warn("Backend API is down, running in static fallback mode:", error);
      setData(MOCK_PRODUCTS);
      setIsError("");
    }
  };

  const clearCart =() =>{
    setCart([]);
  }
  
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  return (
    <AppContext.Provider value={{ data, isError, cart, addToCart, removeFromCart,refreshData, clearCart  }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;