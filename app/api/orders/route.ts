import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const date = searchParams.get("date")

    let orders
    // Try to get payment_method if it exists, otherwise use default value
    const query = `
      SELECT 
        id, 
        order_number, 
        customer_name, 
        customer_phone, 
        delivery_type, 
        delivery_fee, 
        CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_method') 
          THEN payment_method 
          ELSE 'efectivo' 
        END as payment_method, 
        subtotal, 
        total, 
        status, 
        notes, 
        created_at, 
        updated_at 
      FROM orders
    `

    if (status && status !== "todos") {
      orders = await sql`
        SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, COALESCE(payment_method, 'efectivo') as payment_method, subtotal, total, status, notes, created_at, updated_at FROM orders
        WHERE status = ${status}
        ORDER BY created_at DESC
      `
    } else if (date) {
      orders = await sql`
        SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, COALESCE(payment_method, 'efectivo') as payment_method, subtotal, total, status, notes, created_at, updated_at FROM orders
        WHERE DATE(created_at) = ${date}
        ORDER BY created_at DESC
      `
    } else {
      orders = await sql`
        SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, COALESCE(payment_method, 'efectivo') as payment_method, subtotal, total, status, notes, created_at, updated_at FROM orders
        WHERE DATE(created_at) = CURRENT_DATE
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    // If payment_method column doesn't exist, try without it
    try {
      let orders
      if (status && status !== "todos") {
        orders = await sql`
          SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, subtotal, total, status, notes, created_at, updated_at FROM orders
          WHERE status = ${status}
          ORDER BY created_at DESC
        `
      } else if (date) {
        orders = await sql`
          SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, subtotal, total, status, notes, created_at, updated_at FROM orders
          WHERE DATE(created_at) = ${date}
          ORDER BY created_at DESC
        `
      } else {
        orders = await sql`
          SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, subtotal, total, status, notes, created_at, updated_at FROM orders
          WHERE DATE(created_at) = CURRENT_DATE
          ORDER BY created_at DESC
        `
      }
      // Add default payment_method to all orders
      const ordersWithPayment = orders.map((o: any) => ({
        ...o,
        payment_method: 'efectivo'
      }))
      return NextResponse.json(ordersWithPayment)
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError)
      return NextResponse.json(
        { error: "Error al cargar pedidos" },
        { status: 500 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customer_name,
      customer_phone,
      delivery_type,
      delivery_fee,
      payment_method,
      sold_by,
      notes,
      items,
    } = body

    // Generate order number
    const today = new Date()
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`
    const countResult = await sql`
      SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE
    `
    const orderNum = `VV-${dateStr}-${String(Number(countResult[0].count) + 1).padStart(3, "0")}`

    // Calculate subtotal
    let subtotal = 0
    for (const item of items) {
      const itemTotal =
        item.unit_price * item.quantity +
        (item.toppings || []).reduce(
          (sum: number, t: { price: number }) => sum + t.price,
          0
        ) *
          item.quantity
      subtotal += itemTotal
    }

    const total = subtotal + (delivery_fee || 0)

    // Create order with status "listo"
    const orderResult = await sql`
      INSERT INTO orders (order_number, customer_name, customer_phone, delivery_type, delivery_fee, payment_method, sold_by, subtotal, total, status, notes)
      VALUES (${orderNum}, ${customer_name || null}, ${customer_phone || null}, ${delivery_type || "local"}, ${delivery_fee || 0}, ${payment_method || "efectivo"}, ${sold_by || "leonardo"}, ${subtotal}, ${total}, 'listo', ${notes || null})
      RETURNING *
    `

    const order = orderResult[0]

    // Create order items and toppings
    for (const item of items) {
      const itemSubtotal =
        (item.unit_price +
          (item.toppings || []).reduce(
            (sum: number, t: { price: number }) => sum + t.price,
            0
          )) *
        item.quantity

      const itemResult = await sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
        VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.unit_price}, ${itemSubtotal})
        RETURNING *
      `

      if (item.toppings && item.toppings.length > 0) {
        for (const topping of item.toppings) {
          await sql`
            INSERT INTO order_item_toppings (order_item_id, product_id, topping_name, price)
            VALUES (${itemResult[0].id}, ${topping.product_id}, ${topping.topping_name}, ${topping.price})
          `
        }
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Error al crear pedido" },
      { status: 500 }
    )
  }
}
