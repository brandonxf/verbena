"use client"

import useSWR from "swr"
import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Clock,
  ChefHat,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { formatCOP, type Order } from "@/lib/types"
import { toast } from "sonner"
import { OrderCard } from "@/components/order-card"
import { OrderDetailsModal } from "@/components/order-details-modal"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusFilters = [
  { value: "todos", label: "Todos", icon: RefreshCw },
  { value: "pendiente", label: "Pendiente", icon: Clock },
  { value: "preparando", label: "Preparando", icon: ChefHat },
  { value: "listo", label: "Listo", icon: CheckCircle2 },
  { value: "entregado", label: "Entregado", icon: Truck },
  { value: "cancelado", label: "Cancelado", icon: XCircle },
]

export default function PedidosPage() {
  const [filter, setFilter] = useState("todos")
  const [selectedOrder, setSelectedOrder] = useState<(Order & { items?: any[] }) | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: orders, mutate } = useSWR<Order[]>(
    `/api/orders${filter !== "todos" ? `?status=${filter}` : ""}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  async function updateStatus(id: number, status: string) {
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

  async function handleViewDetails(order: Order) {
    try {
      const res = await fetch(`/api/orders/${order.id}`)
      if (!res.ok) throw new Error()
      const orderWithDetails = await res.json()
      setSelectedOrder(orderWithDetails)
      setIsModalOpen(true)
    } catch {
      toast.error("Error al cargar detalles del pedido")
    }
  }

  const activeOrders = orders?.filter((o) => o.status !== "entregado" && o.status !== "cancelado") || []
  const completedOrders = orders?.filter((o) => o.status === "entregado" || o.status === "cancelado") || []

  const todayTotal = orders
    ?.filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + Number(o.total), 0) || 0

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Hoy: {orders?.length || 0} pedidos / {formatCOP(todayTotal)}
          </p>
        </div>
        <Link
          href="/pedidos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Pedido
        </Link>
      </div>

      {/* Status filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setFilter(sf.value)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === sf.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            <sf.icon className="h-3.5 w-3.5" />
            {sf.label}
          </button>
        ))}
      </div>

      {/* Active orders */}
      {filter === "todos" && activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Activos ({activeOrders.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateStatus}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* All/completed orders */}
      <div>
        {filter === "todos" && completedOrders.length > 0 && (
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Completados ({completedOrders.length})
          </h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(filter === "todos" ? completedOrders : orders || []).map(
            (order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateStatus}
                onViewDetails={handleViewDetails}
              />
            )
          )}
        </div>
      </div>

      {orders && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-medium text-foreground">
            No hay pedidos
          </h3>
          <p className="text-sm text-muted-foreground">
            {filter !== "todos"
              ? "No hay pedidos con este estado"
              : "Aun no hay pedidos hoy. Crea uno nuevo."}
          </p>
        </div>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOrder(null)
        }}
      />
    </div>
  )
}
