import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../store/CartContext.tsx'
import { CartIcon, MoonIcon, SearchIcon, SunIcon } from './icons.tsx'

type Theme = 'light' | 'dark'

const NAV_CATEGORIES = ['Laptop', 'Desktop', 'Mobile', 'Tablet', 'Audio', 'Wearables', 'Gaming', 'Photography', 'Footwear', 'Fashion', 'Accessories', 'Beauty', 'Home', 'Toys', 'Sports']

const initialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  return 'light'
}

export default function Navbar() {
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') ?? '')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}#shop` : '/#shop')
  }

  const activeCategory = new URLSearchParams(location.search).get('category')

  return (
    <header className="site-header">
      <div className="announce">Free shipping on orders over $100 · 30-day easy returns</div>
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setQuery('')}>
          Ecom<span>.</span>
        </Link>
        <form className="search" onSubmit={submit} role="search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search for products, brands and more"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </form>
        <nav className="nav-actions">
          <NavLink to="/add_product" className="nav-link">
            Sell
          </NavLink>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <NavLink to="/cart" className="icon-btn cart-btn" aria-label={`Cart, ${count} items`}>
            <CartIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </NavLink>
        </nav>
      </div>
      <div className="cat-bar">
        <div className="container cat-inner">
          <Link to="/#shop" className={!activeCategory ? 'active' : ''}>
            All
          </Link>
          {NAV_CATEGORIES.map((c) => (
            <Link
              key={c}
              to={`/?category=${encodeURIComponent(c)}#shop`}
              className={activeCategory === c ? 'active' : ''}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
