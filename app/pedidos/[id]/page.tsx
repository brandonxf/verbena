"use client"

import useSWR from "swr"
import { use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  ChefHat,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  Store,
  Phone,
  User,
} from "lucide-react"
import { formatCOP } from "@/lib/types"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string; next?: string; nextLabel?: string }
> = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
    next: "preparando",
    nextLabel: "Iniciar Preparacion",
  },
  preparando: {
    label: "Preparando",
    icon: ChefHat,
    className: "bg-orange-100 text-orange-700",
    next: "listo",
    nextLabel: "Marcar como Listo",
  },
  listo: {
    label: "Listo para Entregar",
    icon: CheckCircle2,
    className: "bg-success/15 text-success",
    next: "entregado",
    nextLabel: "Marcar como Entregado",
  },
  entregado: {
    label: "Entregado",
    icon: Truck,
    className: "bg-primary/15 text-primary",
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    className: "bg-destructive/15 text-destructive",
  },
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: order, mutate } = useSWR(`/api/orders/${id}`, fetcher)

  async function updateStatus(status: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Pedido actualizado a "${status}"`)
      mutate()
    } catch {
      toast.error("Error al actualizar pedido")
    }
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const config = statusConfig[order.status]
  const StatusIcon = config.icon

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/pedidos"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${config.className}`}
              >
                <StatusIcon className="h-4 w-4" />
                {config.label}
              </span>
              <div className="flex gap-2">
                {config.next && (
                  <button
                    onClick={() => updateStatus(config.next!)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {config.nextLabel}
                  </button>
                )}
                {order.status === "pendiente" && (
                  <button
                    onClick={() => updateStatus("cancelado")}
                    className="rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Productos
            </h2>
            <div className="space-y-3">
              {order.items?.map(
                (item: {
                  id: number
                  product_name: string
                  quantity: number
                  unit_price: number
                  subtotal: number
                  toppings: { id: number; topping_name: string; price: number }[]
                }) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.product_name}{" "}
                          <span className="text-muted-foreground">
                            x{item.quantity}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCOP(Number(item.unit_price))} c/u
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {formatCOP(Number(item.subtotal))}
                      </p>
                    </div>
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {item.toppings.map(
                          (t: {
                            id: number
                            topping_name: string
                            price: number
                          }) => (
                            <p
                              key={t.id}
                              className="text-xs text-muted-foreground"
                            >
                              + {t.topping_name} ({formatCOP(Number(t.price))})
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Cliente
            </h2>
            {order.customer_name ? (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {order.customer_name}
                </p>
                {order.customer_phone && (
                  <p className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {order.customer_phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}

            <div className="mt-3 flex items-center gap-2 text-sm text-foreground">
              {order.delivery_type === "domicilio" ? (
                <>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Domicilio
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 text-muted-foreground" />
                  Recoger en Local
                </>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Resumen
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCOP(Number(order.subtotal))}</span>
              </div>
              {Number(order.delivery_fee) > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Domicilio</span>
                  <span>{formatCOP(Number(order.delivery_fee))}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-lg font-bold text-foreground">
                <span>Total</span>
                <span>{formatCOP(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Notas
              </h2>
              <p className="text-sm text-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
