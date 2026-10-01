import { useState } from 'react'
import { imageUrl } from '../api.ts'
import type { Product } from '../types.ts'

type Props = {
  product: Pick<Product, 'id' | 'name' | 'imageUrl' | 'imageName'>
  className?: string
}

/** Uploaded image first, then the product's image URL, then a neutral placeholder. */
export default function ProductImage({ product, className }: Props) {
  const sources = [
    product.imageName ? imageUrl(product.id) : null,
    product.imageUrl || null,
  ].filter((s): s is string => !!s)
  const [failedCount, setFailedCount] = useState(0)
  const src = sources[failedCount]

  if (!src) {
    return (
      <div className={`img-fallback ${className ?? ''}`} role="img" aria-label={product.name}>
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.8" />
          <path d="m4 18 5-5 4 4 3-3 4 4" />
        </svg>
      </div>
    )
  }
  return (
    <img
      className={className}
      src={src}
      alt={product.name}
      loading="lazy"
      onError={() => setFailedCount((n) => n + 1)}
    />
  )
}
