"use client"

import useSWR from "swr"
import { useState } from "react"
import { Calendar, Users, CreditCard, Wind } from "lucide-react"
import { formatCOP } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const COLORS = {
  efectivo: "hsl(140 55% 35%)",
  transferencia: "hsl(200 70% 50%)",
}

const SIZE_COLORS = {
  "8 onz": "hsl(350 70% 45%)",
  "12 onz": "hsl(45 90% 50%)",
  "16 onz": "hsl(200 50% 45%)",
  "20 onz": "hsl(140 55% 35%)",
}

export default function ReportesPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const { data: salesByPerson } = useSWR(
    `/api/reports?type=sales_by_person&date=${date}`,
    fetcher
  )
  const { data: salesByPayment } = useSWR(
    `/api/reports?type=sales_by_payment&date=${date}`,
    fetcher
  )
  const { data: salesBySize } = useSWR(
    `/api/reports?type=sales_by_size&date=${date}`,
    fetcher
  )

  // Calculate totals for payment methods
  const totalRevenue = salesByPayment?.reduce((sum, item) => sum + Number(item.total_sales), 0) || 0

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes de Ventas</h1>
          <p className="text-sm text-muted-foreground">Análisis detallado por vendedor, método de pago y tamaño</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid gap-8">
        {/* Ventas por Personas */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Ventas por Personas</h2>
          </div>

          {salesByPerson && salesByPerson.length > 0 ? (
            <div className="space-y-4">
              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vendedor</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Pedidos</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ticket Promedio</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">% de Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesByPerson.map((person, i) => {
                      const percentage = totalRevenue > 0 ? (Number(person.total_sales) / totalRevenue) * 100 : 0
                      return (
                        <tr key={i} className="border-b border-border hover:bg-secondary/20">
                          <td className="px-4 py-3 font-medium text-foreground capitalize">
                            {person.person}
                          </td>
                          <td className="px-4 py-3 text-center text-foreground">
                            {person.total_orders}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-primary">
                            {formatCOP(Number(person.total_sales))}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {formatCOP(Number(person.average_order))}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {percentage.toFixed(1)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Gráfico */}
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByPerson}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="person" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value) => formatCOP(Number(value))}
                    />
                    <Bar dataKey="total_sales" fill="hsl(200 70% 50%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">No hay datos disponibles</p>
          )}
        </div>

        {/* Ventas por Método de Pago */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Ventas por Método de Pago</h2>
          </div>

          {salesByPayment && salesByPayment.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Tabla */}
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Método</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Pedidos</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Porciento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByPayment.map((payment, i) => {
                        const percentage = totalRevenue > 0 ? (Number(payment.total_sales) / totalRevenue) * 100 : 0
                        const icon = payment.payment_method === "efectivo" ? "💵" : "🏦"
                        return (
                          <tr key={i} className="border-b border-border hover:bg-secondary/20">
                            <td className="px-4 py-3 font-medium text-foreground">
                              {icon} {payment.payment_method === "efectivo" ? "Efectivo" : "Transferencia"}
                            </td>
                            <td className="px-4 py-3 text-center text-foreground">
                              {payment.total_orders}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-primary">
                              {formatCOP(Number(payment.total_sales))}
                            </td>
                            <td className="px-4 py-3 text-right text-foreground">
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gráfico Pie */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesByPayment}
                      dataKey="total_sales"
                      nameKey="payment_method"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ payment_method, percent }) =>
                        `${payment_method === "efectivo" ? "💵" : "🏦"} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {salesByPayment.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.payment_method] || "#8b5cf6"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCOP(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">No hay datos disponibles</p>
          )}
        </div>

        {/* Ventas por Tamaño de Vaso */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Ventas por Tamaño de Vaso</h2>
          </div>

          {salesBySize && salesBySize.length > 0 ? (
            <div className="space-y-4">
              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tamaño</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Unidades</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio Promedio</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesBySize.map((size, i) => {
                      const sizeTotal = salesBySize.reduce((sum, s) => sum + Number(s.total_sales), 0)
                      const percentage = sizeTotal > 0 ? (Number(size.total_sales) / sizeTotal) * 100 : 0
                      return (
                        <tr key={i} className="border-b border-border hover:bg-secondary/20">
                          <td className="px-4 py-3 font-medium text-foreground">{size.size}</td>
                          <td className="px-4 py-3 text-center text-foreground">{size.total_units}</td>
                          <td className="px-4 py-3 text-right font-semibold text-primary">
                            {formatCOP(Number(size.total_sales))}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {formatCOP(Number(size.average_price))}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {percentage.toFixed(1)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Gráfico */}
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={salesBySize}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="size" type="category" className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value) => formatCOP(Number(value))}
                    />
                    <Bar dataKey="total_sales" fill="hsl(140 55% 35%)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  )
}
