import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await sql`SELECT * FROM orders WHERE id = ${parseInt(id)}`
    if (order.length === 0) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    const items = await sql`
      SELECT oi.*, 
        COALESCE(json_agg(
          json_build_object('id', oit.id, 'topping_name', oit.topping_name, 'price', oit.price)
        ) FILTER (WHERE oit.id IS NOT NULL), '[]') as toppings
      FROM order_items oi
      LEFT JOIN order_item_toppings oit ON oit.order_item_id = oi.id
      WHERE oi.order_id = ${parseInt(id)}
      GROUP BY oi.id
      ORDER BY oi.id
    `

    return NextResponse.json({ ...order[0], items })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Error al cargar pedido" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const result = await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Error al actualizar pedido" },
      { status: 500 }
    )
  }
}
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Delete order items toppings first
    await sql`
      DELETE FROM order_item_toppings
      WHERE order_item_id IN (
        SELECT id FROM order_items WHERE order_id = ${parseInt(id)}
      )
    `

    // Delete order items
    await sql`
      DELETE FROM order_items WHERE order_id = ${parseInt(id)}
    `

    // Delete order
    const result = await sql`
      DELETE FROM orders WHERE id = ${parseInt(id)}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { error: "Error al eliminar pedido" },
      { status: 500 }
    )
  }
}