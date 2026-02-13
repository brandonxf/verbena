"use client"

import {
  Clock,
  ChefHat,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  Store,
  Phone,
  DollarSign,
  Package,
} from "lucide-react"
import { formatCOP, type Order } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
  },
  preparando: {
    label: "Preparando",
    icon: ChefHat,
    className: "bg-orange-100 text-orange-700",
  },
  listo: {
    label: "Listo",
    icon: CheckCircle2,
    className: "bg-success/15 text-success",
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

export interface OrderDetailsModalProps {
  order: (Order & { items?: any[] }) | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  if (!order) return null

  const config = statusConfig[order.status]
  const StatusIcon = config.icon
  const orderDate = new Date(order.created_at)
  const formattedDate = orderDate.toLocaleDateString("es-CO")
  const formattedTime = orderDate.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{order.order_number}</span>
            <Badge className={`${config.className} border-0`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {formattedDate} · {formattedTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Information */}
          <div>
            <h3 className="mb-3 font-semibold text-foreground">
              Información General
            </h3>
            <div className="space-y-2 text-sm">
              {order.customer_name && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
              )}

              {order.customer_phone && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Teléfono:
                  </span>
                  <span className="font-medium">{order.customer_phone}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  {order.delivery_type === "domicilio" ? (
                    <>
                      <MapPin className="h-4 w-4" />
                      Entrega:
                    </>
                  ) : (
                    <>
                      <Store className="h-4 w-4" />
                      Retiro:
                    </>
                  )}
                </span>
                <span className="font-medium capitalize">
                  {order.delivery_type === "domicilio" ? "Domicilio" : "Local"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  💳 Método de pago:
                </span>
                <span className="font-medium capitalize">
                  {order.payment_method === "efectivo" ? "💵 Efectivo" : "🏦 Transferencia"}
                </span>
              </div>

              {order.notes && (
                <div>
                  <span className="text-muted-foreground">Notas:</span>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Package className="h-4 w-4" />
              Items del Pedido
            </h3>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-secondary/20 p-3"
                  >
                    <div className="mb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatCOP(Number(item.subtotal))}
                        </p>
                      </div>
                    </div>

                    {/* Toppings */}
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-border pt-2 pl-4">
                        {item.toppings.map((topping: any) => (
                          <div
                            key={topping.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground">
                              + {topping.topping_name}
                            </span>
                            <span className="text-muted-foreground">
                              {formatCOP(Number(topping.price))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No hay items en este pedido
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <DollarSign className="h-4 w-4" />
              Resumen de Pago
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  {formatCOP(Number(order.subtotal))}
                </span>
              </div>

              {order.delivery_fee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Envío:</span>
                  <span className="font-medium">
                    {formatCOP(Number(order.delivery_fee))}
                  </span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCOP(Number(order.total))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
