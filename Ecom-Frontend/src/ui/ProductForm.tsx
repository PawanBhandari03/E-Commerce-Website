import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProduct, errorMessage, getProduct, updateProduct } from '../api.ts'
import type { ProductInput } from '../types.ts'

const empty: ProductInput = {
  name: '',
  brand: '',
  description: '',
  price: 0,
  category: '',
  releaseDate: new Date().toISOString().slice(0, 10),
  imageUrl: '',
  stockQuantity: 1,
}

const CATEGORIES = ['Laptop', 'Headphone', 'Mobile', 'Electronics', 'Toys', 'Fashion']

export default function ProductForm() {
  const { id } = useParams()
  const editing = id !== undefined
  const navigate = useNavigate()
  const [form, setForm] = useState<ProductInput>(empty)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editing) return
    getProduct(Number(id))
      .then((p) =>
        setForm({
          name: p.name,
          brand: p.brand,
          description: p.description,
          price: p.price,
          category: p.category,
          releaseDate: p.releaseDate?.slice(0, 10) ?? '',
          stockQuantity: p.stockQuantity,
          imageUrl: p.imageUrl ?? '',
        }),
      )
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [editing, id])

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateProduct(Number(id), form, image)
        navigate(`/product/${id}`)
      } else {
        const created = await createProduct(form, image)
        navigate(`/product/${created.id}`)
      }
    } catch (err) {
      setError(errorMessage(err))
      setSaving(false)
    }
  }

  if (loading) return <p className="state">Loading…</p>

  return (
    <div className="container page">
    <form className="form" onSubmit={submit}>
      <h1>{editing ? 'Edit product' : 'Add product'}</h1>
      {error && <p className="error">{error}</p>}
      <label>
        Name
        <input required value={form.name} onChange={(e) => set('name', e.target.value)} />
      </label>
      <label>
        Brand
        <input required value={form.brand} onChange={(e) => set('brand', e.target.value)} />
      </label>
      <label>
        Description
        <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </label>
      <div className="row">
        <label>
          Price (USD)
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', Number(e.target.value))}
          />
        </label>
        <label>
          Stock
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.stockQuantity}
            onChange={(e) => set('stockQuantity', Number(e.target.value))}
          />
        </label>
      </div>
      <div className="row">
        <label>
          Category
          <select required value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select…</option>
            {[...new Set([...CATEGORIES, form.category].filter(Boolean))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Release date
          <input
            required
            type="date"
            value={form.releaseDate}
            onChange={(e) => set('releaseDate', e.target.value)}
          />
        </label>
      </div>
      <label>
        Image URL
        <input
          type="url"
          placeholder="https://…"
          value={form.imageUrl ?? ''}
          onChange={(e) => set('imageUrl', e.target.value)}
        />
      </label>
      <label>
        Or upload an image {editing && <span className="muted small">(leave empty to keep the current one)</span>}
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
      </label>
      <div className="actions">
        <button className="btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </form>
    </div>
  )
}
