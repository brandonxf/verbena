import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Today's orders summary
    const todaySummary = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'entregado' THEN total ELSE 0 END), 0) as delivered_revenue,
        COUNT(CASE WHEN status = 'pendiente' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'preparando' THEN 1 END) as preparing_count,
        COUNT(CASE WHEN status = 'listo' THEN 1 END) as ready_count,
        COUNT(CASE WHEN status = 'entregado' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelled_count
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
    `

    // Top products today
    const topProducts = await sql`
      SELECT oi.product_name, SUM(oi.quantity) as total_quantity, SUM(oi.subtotal) as total_sales
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE DATE(o.created_at) = CURRENT_DATE AND o.status != 'cancelado'
      GROUP BY oi.product_name
      ORDER BY total_quantity DESC
      LIMIT 5
    `

    // Sales by hour today
    const salesByHour = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelado'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `

    // Low stock alerts
    const lowStock = await sql`
      SELECT i.*, p.name as product_name, p.category as product_category
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      WHERE i.stock_quantity <= i.min_stock AND p.is_active = true
      ORDER BY i.stock_quantity ASC
    `

    // Last 7 days revenue
    const weeklyRevenue = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days' AND status != 'cancelado'
      GROUP BY DATE(created_at)
      ORDER BY date
    `

    return NextResponse.json({
      today: todaySummary[0],
      topProducts,
      salesByHour,
      lowStock,
      weeklyRevenue,
    })
  } catch (error) {
    console.error("Error fetching dashboard:", error)
    return NextResponse.json(
      { error: "Error al cargar dashboard" },
      { status: 500 }
    )
  }
}
