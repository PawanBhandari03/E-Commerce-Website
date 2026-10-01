import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { errorMessage, getProducts, searchProducts } from '../api.ts'
import { useCart } from '../store/CartContext.tsx'
import type { Product } from '../types.ts'
import ProductImage from './ProductImage.tsx'
import { CheckIcon, ReturnIcon, ShieldIcon, TruckIcon } from './icons.tsx'
import { money } from './format.ts'

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'name'

const HERO_IMG = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80'

function AddButton({ product }: { product: Product }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1400)
    return () => clearTimeout(t)
  }, [added])

  return (
    <button
      className={`btn small ${added ? 'success' : ''}`}
      disabled={!product.productAvailable}
      onClick={() => {
        add(product)
        setAdded(true)
      }}
    >
      {!product.productAvailable ? 'Sold out' : added ? <><CheckIcon /> Added</> : 'Add to cart'}
    </button>
  )
}

export default function Home() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q')?.trim() ?? ''
  const category = params.get('category') ?? 'All'
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState<Sort>('featured')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const request = q ? searchProducts(q) : getProducts()
    request
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [q])

  // scroll to the shop section when arriving via a category / search link
  useEffect(() => {
    if (!loading && window.location.hash === '#shop') {
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading, category, q])

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products],
  )

  const visible = useMemo(() => {
    const list = category === 'All' ? [...products] : products.filter((p) => p.category === category)
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, category, sort])

  const setCategory = (c: string) => {
    const next = new URLSearchParams(params)
    if (c === 'All') next.delete('category')
    else next.set('category', c)
    setParams(next, { replace: true })
  }

  const showHero = !q && category === 'All'

  return (
    <>
      {showHero && (
        <>
          <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,12,18,.78), rgba(10,12,18,.2)), url(${HERO_IMG})` }}>
            <div className="container hero-inner">
              <span className="eyebrow">New season</span>
              <h1>Everything you need, curated for you.</h1>
              <p>Premium tech, footwear and essentials from brands you trust, delivered fast.</p>
              <a href="#shop" className="btn light">
                Shop now
              </a>
            </div>
          </section>
          <section className="container perks">
            <div><TruckIcon /><span><b>Free delivery</b> on orders over $100</span></div>
            <div><ReturnIcon /><span><b>30-day returns</b> no questions asked</span></div>
            <div><ShieldIcon /><span><b>Secure checkout</b> and 2-year warranty</span></div>
          </section>
        </>
      )}

      <section id="shop" className="container shop">
        <div className="shop-head">
          <div>
            <h2>{q ? `Results for “${q}”` : category === 'All' ? 'All products' : category}</h2>
            <p className="muted">
              {loading ? 'Loading…' : `${visible.length} item${visible.length === 1 ? '' : 's'}`}
              {q && (
                <>
                  {' · '}
                  <Link to="/#shop">Clear search</Link>
                </>
              )}
            </p>
          </div>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>

        <div className="chips">
          {['All', ...categories].map((c) => (
            <button key={c} className={`chip ${c === category ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {error ? (
          <p className="state error">{error}</p>
        ) : loading ? (
          <div className="grid">
            {Array.from({ length: 8 }, (_, i) => (
              <div className="card skeleton" key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="state">No products found. Try a different search or category.</p>
        ) : (
          <div className="grid">
            {visible.map((p) => (
              <article className="card" key={p.id}>
                <Link to={`/product/${p.id}`} className="card-img">
                  <ProductImage product={p} />
                  {!p.productAvailable && <span className="tag">Sold out</span>}
                  {p.productAvailable && p.stockQuantity <= 10 && (
                    <span className="tag warn">Only {p.stockQuantity} left</span>
                  )}
                </Link>
                <div className="card-body">
                  <span className="brand-label">{p.brand}</span>
                  <Link to={`/product/${p.id}`} className="card-title">
                    {p.name}
                  </Link>
                  <div className="card-foot">
                    <strong className="price-sm">{money(p.price)}</strong>
                    <AddButton product={p} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="brand">
              Ecom<span>.</span>
            </div>
            <p className="muted small">Quality products, honest prices.</p>
          </div>
          <div className="muted small">© {new Date().getFullYear()} Ecom Store. All rights reserved.</div>
        </div>
      </footer>
    </>
  )
}
