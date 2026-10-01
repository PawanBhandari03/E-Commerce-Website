import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types.ts'

interface CartValue {
  items: CartItem[]
  count: number
  total: number
  add: (p: Product) => void
  setQuantity: (id: number, qty: number) => void
  remove: (id: number) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)
const KEY = 'cart.v2'

const load = (): CartItem[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable */
    }
  }, [items])

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + i.quantity * i.product.price, 0),
      add: (p) =>
        setItems((cur) => {
          const found = cur.find((i) => i.product.id === p.id)
          if (!found) return [...cur, { product: p, quantity: 1 }]
          return cur.map((i) =>
            i.product.id === p.id ? { ...i, quantity: Math.min(i.quantity + 1, p.stockQuantity) } : i,
          )
        }),
      setQuantity: (id, qty) =>
        setItems((cur) =>
          cur.map((i) =>
            i.product.id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.product.stockQuantity)) } : i,
          ),
        ),
      remove: (id) => setItems((cur) => cur.filter((i) => i.product.id !== id)),
      clear: () => setItems([]),
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
