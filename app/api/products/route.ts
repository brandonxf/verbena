import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await sql`
      SELECT * FROM products ORDER BY category, name
    `
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Error al cargar productos" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category } = body

    const result = await sql`
      INSERT INTO products (name, description, price, category)
      VALUES (${name}, ${description || null}, ${price}, ${category})
      RETURNING *
    `

    // Also create inventory entry
    await sql`
      INSERT INTO inventory (product_id, stock_quantity, unit, min_stock)
      VALUES (${result[0].id}, 0, ${category === "granizado" ? "litro" : "unidad"}, 10)
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    )
  }
}
