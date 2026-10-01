import { useState } from 'react'
import { Link } from 'react-router-dom'
import { checkout, errorMessage } from '../api.ts'
import { useCart } from '../store/CartContext.tsx'
import ProductImage from './ProductImage.tsx'
import { CheckIcon, TrashIcon } from './icons.tsx'
import { money } from './format.ts'

const FREE_SHIPPING_OVER = 100
const SHIPPING = 9.99

export default function Cart() {
  const { items, total, setQuantity, remove, clear } = useCart()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const shipping = total >= FREE_SHIPPING_OVER || total === 0 ? 0 : SHIPPING

  const placeOrder = async () => {
    setBusy(true)
    setError('')
    try {
      await checkout(items.map((i) => ({ id: i.product.id, quantity: i.quantity })))
      clear()
      setDone(true)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="container state">
        <span className="done-mark"><CheckIcon /></span>
        <h2>Thank you, your order is placed</h2>
        <p>We'll start preparing it right away.</p>
        <Link className="btn" to="/">
          Continue shopping
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container state">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link className="btn" to="/#shop">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container page">
      <h1 className="page-title">Shopping cart</h1>
      <div className="cart-layout">
        <div className="cart-list">
          {items.map(({ product: p, quantity }) => (
            <div className="cart-row" key={p.id}>
              <Link to={`/product/${p.id}`} className="cart-thumb">
                <ProductImage product={p} />
              </Link>
              <div className="cart-info">
                <span className="brand-label">{p.brand}</span>
                <Link to={`/product/${p.id}`} className="card-title">
                  {p.name}
                </Link>
                <span className="muted small">{money(p.price)} each</span>
              </div>
              <div className="stepper">
                <button onClick={() => setQuantity(p.id, quantity - 1)} aria-label="Decrease quantity">
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(p.id, quantity + 1)}
                  disabled={quantity >= p.stockQuantity}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <strong className="cart-price">{money(p.price * quantity)}</strong>
              <button className="icon-btn plain" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`}>
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3>Order summary</h3>
          <div className="sum-row"><span>Subtotal</span><span>{money(total)}</span></div>
          <div className="sum-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
          </div>
          <div className="sum-row sum-total"><span>Total</span><span>{money(total + shipping)}</span></div>
          {error && <p className="error">{error}</p>}
          <button className="btn big full" disabled={busy} onClick={placeOrder}>
            {busy ? 'Placing order…' : 'Checkout'}
          </button>
          <Link to="/#shop" className="muted small center">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}
