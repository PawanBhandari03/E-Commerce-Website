import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteProduct, errorMessage, getProduct } from '../api.ts'
import { useCart } from '../store/CartContext.tsx'
import type { Product } from '../types.ts'
import ProductImage from './ProductImage.tsx'
import { isDemo } from '../data/demoProducts.ts'
import { CheckIcon, ReturnIcon, ShieldIcon, TruckIcon } from './icons.tsx'
import { money } from './format.ts'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add, remove } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setProduct(null)
    setError('')
    getProduct(Number(id))
      .then(setProduct)
      .catch((e) => setError(errorMessage(e)))
  }, [id])

  if (error) return <p className="state error container">{error}</p>
  if (!product) return <p className="state container">Loading…</p>

  const onDelete = async () => {
    if (!window.confirm(`Delete “${product.name}”?`)) return
    try {
      await deleteProduct(product.id)
      remove(product.id)
      navigate('/')
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <div className="container page">
      <nav className="crumbs">
        <Link to="/">Home</Link> / <Link to={`/?category=${encodeURIComponent(product.category)}#shop`}>{product.category}</Link> /{' '}
        <span>{product.name}</span>
      </nav>
      <div className="detail">
        <div className="detail-media">
          <ProductImage product={product} />
        </div>
        <div className="detail-info">
          <span className="brand-label">{product.brand}</span>
          <h1>{product.name}</h1>
          <p className="price">{money(product.price)}</p>
          <p className="desc">{product.description}</p>
          <p className={product.productAvailable ? 'ok stock' : 'error stock'}>
            {product.productAvailable
              ? product.stockQuantity <= 10
                ? `Only ${product.stockQuantity} left in stock`
                : 'In stock'
              : 'Out of stock'}
          </p>
          <div className="actions">
            <button
              className={`btn big ${added ? 'success' : ''}`}
              disabled={!product.productAvailable}
              onClick={() => {
                add(product)
                setAdded(true)
                setTimeout(() => setAdded(false), 1400)
              }}
            >
              {added ? <><CheckIcon /> Added to cart</> : 'Add to cart'}
            </button>
            <Link className="btn ghost big" to="/cart">
              View cart
            </Link>
          </div>
          <ul className="assure">
            <li><TruckIcon /> Free delivery over $100</li>
            <li><ReturnIcon /> 30-day returns</li>
            <li><ShieldIcon /> 2-year warranty</li>
          </ul>
          {!isDemo(product.id) && (
          <div className="admin">
            <span className="muted small">Manage listing</span>
            <Link className="btn ghost small" to={`/product/update/${product.id}`}>
              Edit
            </Link>
            <button className="btn danger-outline small" onClick={onDelete}>
              Delete
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
