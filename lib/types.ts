export type Product = {
  id: number
  name: string
  description: string | null
  price: number
  category: "granizado" | "topping" | "extra"
  is_active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export type InventoryItem = {
  id: number
  product_id: number
  stock_quantity: number
  unit: string
  min_stock: number
  updated_at: string
  product_name?: string
  product_category?: string
}

export type Order = {
  id: number
  order_number: string
  customer_name: string | null
  customer_phone: string | null
  delivery_type: "local" | "domicilio"
  delivery_fee: number
  payment_method: "efectivo" | "transferencia"
  subtotal: number
  total: number
  status: "pendiente" | "preparando" | "listo" | "entregado" | "cancelado"
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: number
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  toppings?: OrderItemTopping[]
}

export type OrderItemTopping = {
  id: number
  order_item_id: number
  product_id: number
  topping_name: string
  price: number
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
