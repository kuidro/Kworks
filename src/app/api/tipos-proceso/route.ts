import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const tipos = await prisma.tipoProceso.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(tipos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { nombre, descripcion } = body

    if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
      return NextResponse.json({ error: "Nombre requerido (mínimo 2 caracteres)" }, { status: 400 })
    }

    const tipo = await prisma.tipoProceso.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
      },
    })

    return NextResponse.json(tipo, { status: 201 })
  } catch (error) {
    console.error("Error al crear tipo de proceso:", error)
    return NextResponse.json({ error: "Error al crear tipo de proceso" }, { status: 500 })
  }
}
