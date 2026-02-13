"use client"

import useSWR from "swr"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Store,
  ShoppingCart,
} from "lucide-react"
import Link from "next/link"
import { formatCOP, type Product } from "@/lib/types"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type CartItem = {
  product_id: number
  product_name: string
  unit_price: number
  quantity: number
  toppings: { product_id: number; topping_name: string; price: number }[]
}

export default function NuevoPedidoPage() {
  const router = useRouter()
  const { data: products } = useSWR<Product[]>("/api/products", fetcher)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryType, setDeliveryType] = useState<"domicilio">("domicilio")
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [seller, setSeller] = useState<"leonardo" | "manuel">("leonardo")
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">("efectivo")
  const [selectingToppingsFor, setSelectingToppingsFor] = useState<number | null>(null)

  const granizados = products?.filter((p) => p.category === "granizado" && p.is_active) || []
  const toppings = products?.filter((p) => p.category === "topping" && p.is_active) || []

  function addToCart(product: Product) {
    setCart((prev) => [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        unit_price: Number(product.price),
        quantity: 1,
        toppings: [],
      },
    ])
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index))
    if (selectingToppingsFor === index) setSelectingToppingsFor(null)
  }

  function updateQuantity(index: number, delta: number) {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  function toggleTopping(
    cartIndex: number,
    topping: Product
  ) {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== cartIndex) return item
        const exists = item.toppings.find((t) => t.product_id === topping.id)
        if (exists) {
          return {
            ...item,
            toppings: item.toppings.filter((t) => t.product_id !== topping.id),
          }
        }
        return {
          ...item,
          toppings: [
            ...item.toppings,
            {
              product_id: topping.id,
              topping_name: topping.name,
              price: Number(topping.price),
            },
          ],
        }
      })
    )
  }

  const subtotal = cart.reduce((sum, item) => {
    const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0)
    return sum + (item.unit_price + toppingTotal) * item.quantity
  }, 0)

  const total = subtotal + deliveryFee

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error("Agrega al menos un producto")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          delivery_type: deliveryType,
          delivery_fee: deliveryType === "domicilio" ? deliveryFee : 0,
          payment_method: paymentMethod,
          sold_by: seller,
          notes: notes || null,
          items: cart,
        }),
      })

      if (!res.ok) throw new Error()
      toast.success("Pedido creado exitosamente")
      router.push("/pedidos")
    } catch {
      toast.error("Error al crear el pedido")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/pedidos"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Pedido</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Product selection */}
        <div className="lg:col-span-3">
          {/* Granizados */}
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Granizados
            </h2>
            <div className="grid gap-3 grid-cols-3">
              {/* Show exactly three size options */}
              {(() => {
                const basePrice = granizados[0]?.price ? Number(granizados[0].price) : 8000
                const sizes = [
                  { label: "8 onz", price: basePrice },
                  { label: "12 onz", price: Math.round(basePrice * 1.4) },
                  { label: "16 onz", price: Math.round(basePrice * 1.8) },
                ]

                return sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() =>
                      setCart((prev) => [
                        ...prev,
                        {
                          product_id: granizados[0]?.id ?? 0,
                          product_name: s.label,
                          unit_price: s.price,
                          quantity: 1,
                          toppings: [],
                        },
                      ])
                    }
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-sm transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                      <ShoppingCart className="h-5 w-5 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{s.label}</span>
                    <span className="text-sm font-bold text-primary">{formatCOP(s.price)}</span>
                  </button>
                ))
              })()}
            </div>
          </div>

          {/* Customer info */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Datos del Cliente (opcional)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="tel"
                placeholder="Telefono"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Seller */}
            <div className="mt-3">
              <label className="mb-1 block text-xs text-muted-foreground">Vendedor</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSeller("leonardo")}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    seller === "leonardo"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Leonardo
                </button>
                <button
                  onClick={() => setSeller("manuel")}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    seller === "manuel"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Manuel
                </button>
              </div>
            </div>

            {/* Delivery */}
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Tipo de entrega
              </h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <button
                    onClick={() => setDeliveryType("domicilio")}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      deliveryType === "domicilio"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    Domicilio
                  </button>
                </div>
              </div>
              {deliveryType === "domicilio" && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Costo de domicilio (COP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Método de pago
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod("efectivo")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    paymentMethod === "efectivo"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  💵 Efectivo
                </button>
                <button
                  onClick={() => setPaymentMethod("transferencia")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    paymentMethod === "transferencia"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  🏦 Transferencia
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <textarea
                placeholder="Notas adicionales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ShoppingCart className="h-4 w-4" />
              Carrito ({cart.length})
            </h2>

            {cart.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Agrega productos al carrito
              </p>
            )}

            <div className="space-y-3">
              {cart.map((item, index) => {
                const toppingTotal = item.toppings.reduce(
                  (s, t) => s + t.price,
                  0
                )
                const itemTotal =
                  (item.unit_price + toppingTotal) * item.quantity

                return (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCOP(item.unit_price)} c/u
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Toppings */}
                    {item.toppings.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {item.toppings.map((t) => (
                          <p
                            key={t.product_id}
                            className="text-xs text-muted-foreground"
                          >
                            + {t.topping_name} ({formatCOP(t.price)})
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Topping selection */}
                    <button
                      onClick={() =>
                        setSelectingToppingsFor(
                          selectingToppingsFor === index ? null : index
                        )
                      }
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      {selectingToppingsFor === index
                        ? "Cerrar toppings"
                        : "Agregar toppings"}
                    </button>

                    {selectingToppingsFor === index && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {toppings.map((topping) => {
                          const isSelected = item.toppings.some(
                            (t) => t.product_id === topping.id
                          )
                          return (
                            <button
                              key={topping.id}
                              onClick={() => toggleTopping(index, topping)}
                              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                              }`}
                            >
                              {topping.name} +{formatCOP(Number(topping.price))}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {formatCOP(itemTotal)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
                {deliveryType === "domicilio" && deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Domicilio</span>
                    <span>{formatCOP(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatCOP(total)}</span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-2 w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Creando..." : "Confirmar Pedido"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
