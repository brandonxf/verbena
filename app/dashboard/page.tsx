"use client"

import useSWR from "swr"
import {
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { formatCOP } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const { data } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 10000,
  })

  if (!data) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const stats = [
    {
      label: "Pedidos Hoy",
      value: data.today.total_orders,
      icon: ShoppingCart,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Ingresos Hoy",
      value: formatCOP(Number(data.today.total_revenue)),
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Entregados",
      value: data.today.delivered_count,
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

  const hourlyData = (data.salesByHour || []).map(
    (h: { hour: number; orders: number; revenue: number }) => ({
      hora: `${String(h.hour).padStart(2, "0")}:00`,
      pedidos: Number(h.orders),
      ingresos: Number(h.revenue),
    })
  )

  const weeklyData = (data.weeklyRevenue || []).map(
    (d: { date: string; orders: number; revenue: number }) => ({
      dia: new Date(d.date).toLocaleDateString("es-CO", { weekday: "short" }),
      ingresos: Number(d.revenue),
      pedidos: Number(d.orders),
    })
  )

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen del dia -{" "}
          {new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly sales chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Ventas por Hora
          </h2>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 12% 86%)" />
                <XAxis
                  dataKey="hora"
                  tick={{ fontSize: 12, fill: "hsl(0 0% 40%)" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "hsl(0 0% 40%)" }} />
                <Tooltip
                  formatter={(value: number) => formatCOP(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(40 12% 86%)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="ingresos"
                  fill="hsl(140 55% 35%)"
                  radius={[4, 4, 0, 0]}
                  name="Ingresos"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Sin datos de ventas hoy
            </p>
          )}
        </div>

        {/* Weekly revenue chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-accent" />
            Ingresos Ultimos 7 Dias
          </h2>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 12% 86%)" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 12, fill: "hsl(0 0% 40%)" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "hsl(0 0% 40%)" }} />
                <Tooltip
                  formatter={(value: number) => formatCOP(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(40 12% 86%)",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="hsl(350 70% 45%)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(350 70% 45%)" }}
                  name="Ingresos"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Sin datos semanales
            </p>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Productos Mas Vendidos
          </h2>
          {data.topProducts && data.topProducts.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map(
                (
                  p: {
                    product_name: string
                    total_quantity: number
                    total_sales: number
                  },
                  i: number
                ) => (
                  <div
                    key={p.product_name}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {p.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.total_quantity} unidades
                      </p>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {formatCOP(Number(p.total_sales))}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin ventas hoy
            </p>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Alertas de Inventario
          </h2>
          {data.lowStock && data.lowStock.length > 0 ? (
            <div className="space-y-3">
              {data.lowStock.map(
                (item: {
                  id: number
                  product_name: string
                  stock_quantity: number
                  min_stock: number
                  unit: string
                }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.min_stock} {item.unit}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">
                      {item.stock_quantity} {item.unit}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin alertas de inventario
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
