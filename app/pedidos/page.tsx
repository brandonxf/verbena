"use client"

import useSWR from "swr"
import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Truck,
  Trash2,
} from "lucide-react"
import { formatCOP, type Order } from "@/lib/types"
import { toast } from "sonner"
import { OrderCard } from "@/components/order-card"
import { OrderDetailsModal } from "@/components/order-details-modal"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PedidosPage() {
  const [selectedOrder, setSelectedOrder] = useState<(Order & { items?: any[] }) | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: orders, mutate } = useSWR<Order[]>(
    `/api/orders`,
    fetcher,
    { refreshInterval: 5000 }
  )

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

  async function deleteOrder(id: number) {
    if (!confirm("¿Estás seguro de que deseas eliminar este pedido?")) return

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success("Pedido eliminado correctamente")
      mutate()
    } catch {
      toast.error("Error al eliminar pedido")
    }
  }

  const listoOrders = orders?.filter((o) => o.status === "listo") || []
  const entregadoOrders = orders?.filter((o) => o.status === "entregado") || []

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

      {/* Pedidos Listos */}
      {listoOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Listos ({listoOrders.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listoOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                onDelete={deleteOrder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pedidos Entregados */}
      {entregadoOrders.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Entregados ({entregadoOrders.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entregadoOrders.map(
              (order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDetails}
                  onDelete={deleteOrder}
                />
              )
            )}
          </div>
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Truck className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-medium text-foreground">
            No hay pedidos
          </h3>
          <p className="text-sm text-muted-foreground">
            Aun no hay pedidos hoy. Crea uno nuevo.
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
