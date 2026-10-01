import axios from 'axios'
import type { Product, ProductInput } from './types.ts'
import { DEMO_PRODUCTS, isDemo } from './data/demoProducts.ts'

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

const http = axios.create({ baseURL: API_BASE })

export const imageUrl = (id: number) => `${API_BASE}/product/${id}/image`

const toForm = (input: ProductInput, image: File | null) => {
  const form = new FormData()
  form.append('product', new Blob([JSON.stringify(input)], { type: 'application/json' }))
  if (image) form.append('imageFile', image)
  return form
}

export const createProduct = (input: ProductInput, image: File | null) =>
  http.post<Product>('/product', toForm(input, image)).then((r) => r.data)
export const updateProduct = (id: number, input: ProductInput, image: File | null) =>
  http.put(`/product/${id}`, toForm(input, image))
export const deleteProduct = (id: number) => http.delete(`/product/${id}`)

export const errorMessage = (e: unknown): string => {
  if (axios.isAxiosError(e)) {
    if (!e.response) return 'Cannot reach the server. Is the backend running on port 8080?'
    return (e.response.data as { message?: string })?.message ?? `Request failed (${e.response.status})`
  }
  return e instanceof Error ? e.message : 'Something went wrong'
}

const withDemo = (real: Product[]): Product[] => {
  const names = new Set(real.map((p) => p.name.toLowerCase()))
  return [...real, ...DEMO_PRODUCTS.filter((p) => !names.has(p.name.toLowerCase()))]
}

const matches = (p: Product, keyword: string) => {
  const k = keyword.toLowerCase()
  return [p.name, p.brand, p.category, p.description].some((v) => v?.toLowerCase().includes(k))
}

export const getProducts = () => http.get<Product[]>('/products').then((r) => withDemo(r.data))

export const searchProducts = (keyword: string) =>
  http
    .get<Product[]>('/products/search', { params: { keyword } })
    .then((r) => [...r.data, ...DEMO_PRODUCTS.filter((p) => matches(p, keyword) && !r.data.some((x) => x.name === p.name))])

export const getProduct = (id: number): Promise<Product> => {
  if (isDemo(id)) {
    const found = DEMO_PRODUCTS.find((p) => p.id === id)
    return found ? Promise.resolve(found) : Promise.reject(new Error('Product not found'))
  }
  return http.get<Product>(`/product/${id}`).then((r) => r.data)
}

/** Demo (frontend-only) products are skipped; only real products are sent to the backend. */
export const checkout = async (items: { id: number; quantity: number }[]) => {
  const real = items.filter((i) => !isDemo(i.id))
  if (real.length > 0) await http.post('/checkout', real)
}
