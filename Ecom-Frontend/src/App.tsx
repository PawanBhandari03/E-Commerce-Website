import { Route, Routes } from 'react-router-dom'
import Navbar from './ui/Navbar.tsx'
import Home from './ui/Home.tsx'
import ProductDetail from './ui/ProductDetail.tsx'
import ProductForm from './ui/ProductForm.tsx'
import Cart from './ui/Cart.tsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/add_product" element={<ProductForm />} />
          <Route path="/product/update/:id" element={<ProductForm />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<p className="state">Page not found.</p>} />
        </Routes>
      </main>
    </>
  )
}
