import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get("estado")

  const procesos = await prisma.proceso.findMany({
    where: estado ? { estado: estado as "BORRADOR" | "ABIERTO" | "EN_PROGRESO" | "CERRADO" } : undefined,
    include: {
      tipoProceso: { select: { id: true, nombre: true } },
      _count: {
        select: {
          postulaciones: true,
          candidatos: true,
        },
      },
    },
    orderBy: { creadoEn: "desc" },
  })

  return NextResponse.json(procesos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { nombre, tipoProcesoId, descripcion, fechaInicio, fechaFin, estado } = body

    if (!nombre || typeof nombre !== "string" || nombre.trim().length < 3) {
      return NextResponse.json({ error: "Nombre requerido (mínimo 3 caracteres)" }, { status: 400 })
    }

    if (!tipoProcesoId) {
      return NextResponse.json({ error: "Tipo de proceso requerido" }, { status: 400 })
    }

    const tipoProceso = await prisma.tipoProceso.findUnique({ where: { id: tipoProcesoId } })
    if (!tipoProceso) {
      return NextResponse.json({ error: "Tipo de proceso no encontrado" }, { status: 404 })
    }

    const proceso = await prisma.proceso.create({
      data: {
        nombre: nombre.trim(),
        tipoProcesoId,
        descripcion: descripcion?.trim() || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado: estado || "BORRADOR",
      },
      include: {
        tipoProceso: { select: { id: true, nombre: true } },
      },
    })

    return NextResponse.json(proceso, { status: 201 })
  } catch (error) {
    console.error("Error al crear proceso:", error)
    return NextResponse.json({ error: "Error al crear proceso" }, { status: 500 })
  }
}
