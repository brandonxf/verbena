"use client"

import {
  Clock,
  ChefHat,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  Store,
} from "lucide-react"
import { formatCOP, type Order } from "@/lib/types"

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string; next?: string; nextLabel?: string }
> = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
    next: "preparando",
    nextLabel: "Preparar",
  },
  preparando: {
    label: "Preparando",
    icon: ChefHat,
    className: "bg-orange-100 text-orange-700",
    next: "listo",
    nextLabel: "Listo",
  },
  listo: {
    label: "Listo",
    icon: CheckCircle2,
    className: "bg-success/15 text-success",
    next: "entregado",
    nextLabel: "Entregar",
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

export function OrderCard({
  order,
  onUpdateStatus,
  onViewDetails,
}: {
  order: Order
  onUpdateStatus: (id: number, status: string) => void
  onViewDetails?: (order: Order) => void
}) {
  const config = statusConfig[order.status]
  const StatusIcon = config.icon
  const time = new Date(order.created_at).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      onClick={() => onViewDetails?.(order)}
      className="cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">
            {order.order_number}
          </p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
        >
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      {order.customer_name && (
        <p className="mb-1 text-sm font-medium text-foreground">
          {order.customer_name}
        </p>
      )}

      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
        {order.delivery_type === "domicilio" ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Domicilio
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Store className="h-3 w-3" /> Local
          </span>
        )}
        {order.delivery_fee > 0 && (
          <span>Envio: {formatCOP(Number(order.delivery_fee))}</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-foreground">
          {formatCOP(Number(order.total))}
        </p>

        <div className="flex gap-2">
          {config.next && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUpdateStatus(order.id, config.next!)
              }}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {config.nextLabel}
            </button>
          )}
          {order.status === "pendiente" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUpdateStatus(order.id, "cancelado")
              }}
              className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
