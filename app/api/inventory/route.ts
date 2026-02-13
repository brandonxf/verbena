import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const inventory = await sql`
      SELECT i.*, p.name as product_name, p.category as product_category
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      WHERE p.is_active = true
      ORDER BY p.category, p.name
    `
    return NextResponse.json(inventory)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { error: "Error al cargar inventario" },
      { status: 500 }
    )
  }
}
