import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const prueba = await prisma.pruebaOnline.findUnique({
    where: { candidatoEnProcesoId: id },
  })

  return NextResponse.json(prueba)
}

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
    const { fechaHora, puntaje, observaciones, completada } = body

    const prueba = await prisma.pruebaOnline.upsert({
      where: { candidatoEnProcesoId: id },
      create: {
        candidatoEnProcesoId: id,
        fechaHora: fechaHora ? new Date(fechaHora) : null,
        puntaje: puntaje !== undefined ? puntaje : null,
        observaciones: observaciones || null,
        completada: completada || false,
      },
      update: {
        fechaHora: fechaHora !== undefined ? (fechaHora ? new Date(fechaHora) : null) : undefined,
        puntaje: puntaje !== undefined ? puntaje : undefined,
        observaciones: observaciones !== undefined ? observaciones : undefined,
        completada: completada !== undefined ? completada : undefined,
      },
    })

    return NextResponse.json(prueba)
  } catch (error) {
    console.error("Error al actualizar prueba:", error)
    return NextResponse.json({ error: "Error al actualizar prueba" }, { status: 500 })
  }
}
