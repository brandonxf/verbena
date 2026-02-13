import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "summary"
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    if (type === "sales_by_person") {
      // Ventas por personas (vendedores)
      try {
        const salesByPerson = await sql`
          SELECT 
            COALESCE(sold_by, 'Sin asignar') as person,
            COUNT(*) as total_orders,
            COALESCE(SUM(total), 0) as total_sales,
            COALESCE(AVG(total), 0) as average_order
          FROM orders
          WHERE DATE(created_at) = ${date} AND status != 'cancelado'
          GROUP BY COALESCE(sold_by, 'Sin asignar')
          ORDER BY total_sales DESC
        `
        return NextResponse.json(salesByPerson)
      } catch (error) {
        console.error("Error fetching sales by person:", error)
        return NextResponse.json([])
      }
    }

    if (type === "sales_by_payment") {
      // Ventas por método de pago
      try {
        const salesByPayment = await sql`
          SELECT 
            COALESCE(payment_method, 'efectivo') as payment_method,
            COUNT(*) as total_orders,
            COALESCE(SUM(total), 0) as total_sales
          FROM orders
          WHERE DATE(created_at) = ${date} AND status != 'cancelado'
          GROUP BY COALESCE(payment_method, 'efectivo')
          ORDER BY total_sales DESC
        `
        return NextResponse.json(salesByPayment)
      } catch (error) {
        console.error("Error fetching sales by payment:", error)
        return NextResponse.json([])
      }
    }

    if (type === "sales_by_size") {
      // Ventas por tamaño de vaso
      try {
        const salesBySize = await sql`
          SELECT 
            oi.product_name as size,
            COUNT(*) as total_units,
            COALESCE(SUM(oi.subtotal), 0) as total_sales,
            COALESCE(AVG(oi.unit_price), 0) as average_price
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          WHERE DATE(o.created_at) = ${date} AND o.status != 'cancelado'
            AND oi.product_name IN ('8 onz', '12 onz', '16 onz', '20 onz')
          GROUP BY oi.product_name
          ORDER BY 
            CASE 
              WHEN oi.product_name = '8 onz' THEN 1
              WHEN oi.product_name = '12 onz' THEN 2
              WHEN oi.product_name = '16 onz' THEN 3
              WHEN oi.product_name = '20 onz' THEN 4
              ELSE 5
            END
        `
        return NextResponse.json(salesBySize)
      } catch (error) {
        console.error("Error fetching sales by size:", error)
        return NextResponse.json([])
      }
    }

    // Default: Day summary
    const summary = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(delivery_fee), 0) as total_delivery_fees,
        COALESCE(SUM(subtotal), 0) as total_subtotal,
        COUNT(CASE WHEN delivery_type = 'domicilio' THEN 1 END) as delivery_orders,
        COUNT(CASE WHEN delivery_type = 'local' THEN 1 END) as local_orders,
        COUNT(CASE WHEN status = 'entregado' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelled_count
      FROM orders
      WHERE DATE(created_at) = ${date}
    `

    return NextResponse.json({
      date,
      summary: summary[0],
    })
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    )
  }
}
