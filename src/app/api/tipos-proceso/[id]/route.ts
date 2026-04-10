import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { nombre, descripcion } = body

    if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
      return NextResponse.json({ error: "Nombre requerido (mínimo 2 caracteres)" }, { status: 400 })
    }

    const tipo = await prisma.tipoProceso.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
      },
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error("Error al actualizar tipo de proceso:", error)
    return NextResponse.json({ error: "Error al actualizar tipo de proceso" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  try {
    // Soft delete: set activo = false
    const tipo = await prisma.tipoProceso.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error("Error al eliminar tipo de proceso:", error)
    return NextResponse.json({ error: "Error al eliminar tipo de proceso" }, { status: 500 })
  }
}
