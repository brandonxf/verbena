import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { stock_quantity, min_stock } = body

    const result = await sql`
      UPDATE inventory
      SET stock_quantity = ${stock_quantity}, min_stock = ${min_stock}, updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json(
      { error: "Error al actualizar inventario" },
      { status: 500 }
    )
  }
}
