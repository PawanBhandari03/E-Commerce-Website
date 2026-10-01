export interface Product {
  id: number
  name: string
  description: string
  brand: string
  price: number
  category: string
  releaseDate: string
  productAvailable: boolean
  stockQuantity: number
  imageUrl?: string | null
  imageName?: string | null
  imageType?: string | null
}

export type ProductInput = Omit<Product, "id" | "productAvailable" | "imageName" | "imageType">

export interface CartItem {
  product: Product
  quantity: number
}
