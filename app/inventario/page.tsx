"use client"

import useSWR from "swr"
import { useState } from "react"
import { AlertTriangle, Save, Package, Droplets } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type InventoryRow = {
  id: number
  product_id: number
  stock_quantity: number
  unit: string
  min_stock: number
  updated_at: string
  product_name: string
  product_category: string
}

export default function InventarioPage() {
  const { data: inventory, mutate } = useSWR<InventoryRow[]>(
    "/api/inventory",
    fetcher
  )
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStock, setEditStock] = useState(0)
  const [editMinStock, setEditMinStock] = useState(0)

  function startEdit(item: InventoryRow) {
    setEditingId(item.id)
    setEditStock(Number(item.stock_quantity))
    setEditMinStock(Number(item.min_stock))
  }

  async function saveEdit(id: number) {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_quantity: editStock,
          min_stock: editMinStock,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Inventario actualizado")
      setEditingId(null)
      mutate()
    } catch {
      toast.error("Error al actualizar")
    }
  }

  const granizadoItems =
    inventory?.filter((i) => i.product_category === "granizado") || []
  const toppingItems =
    inventory?.filter((i) => i.product_category === "topping") || []

  const lowStockCount =
    inventory?.filter(
      (i) => Number(i.stock_quantity) <= Number(i.min_stock)
    ).length || 0

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
        <p className="text-sm text-muted-foreground">
          Control de stock de productos
        </p>
        {lowStockCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            {lowStockCount} producto(s) con stock bajo
          </div>
        )}
      </div>

      {/* Granizados */}
      <div className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Droplets className="h-4 w-4" />
          Granizados
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {granizadoItems.map((item) => {
            const isLow =
              Number(item.stock_quantity) <= Number(item.min_stock)
            const isEditing = editingId === item.id

            return (
              <div
                key={item.id}
                className={`rounded-xl border bg-card p-4 shadow-sm transition-colors ${
                  isLow
                    ? "border-amber-300 bg-amber-50"
                    : "border-border"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    {item.product_name}
                  </h3>
                  {isLow && (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Stock actual ({item.unit})
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Stock minimo
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={editMinStock}
                        onChange={(e) =>
                          setEditMinStock(Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        <Save className="h-3 w-3" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => startEdit(item)}
                    className="cursor-pointer"
                  >
                    <div className="mb-1 flex items-baseline gap-1">
                      <span
                        className={`text-2xl font-bold ${
                          isLow ? "text-warning" : "text-foreground"
                        }`}
                      >
                        {item.stock_quantity}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.unit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isLow ? "bg-warning" : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min(100, (Number(item.stock_quantity) / (Number(item.min_stock) * 3)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Min: {item.min_stock} {item.unit}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Toppings */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Package className="h-4 w-4" />
          Toppings
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Minimo
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {toppingItems.map((item) => {
                const isLow =
                  Number(item.stock_quantity) <= Number(item.min_stock)
                const isEditing = editingId === item.id

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-border last:border-b-0 ${
                      isLow ? "bg-warning/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editStock}
                          onChange={(e) =>
                            setEditStock(Number(e.target.value))
                          }
                          className="w-20 rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      ) : (
                        <span
                          className={
                            isLow
                              ? "font-bold text-warning"
                              : "text-foreground"
                          }
                        >
                          {item.stock_quantity} {item.unit}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editMinStock}
                          onChange={(e) =>
                            setEditMinStock(Number(e.target.value))
                          }
                          className="w-20 rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {item.min_stock} {item.unit}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          Bajo
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-success">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
