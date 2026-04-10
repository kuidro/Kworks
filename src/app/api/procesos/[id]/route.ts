import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const proceso = await prisma.proceso.findUnique({
    where: { id },
    include: {
      tipoProceso: { select: { id: true, nombre: true } },
      postulaciones: {
        orderBy: { creadoEn: "desc" },
        include: {
          candidatoEnProceso: {
            select: {
              id: true,
              estado: true,
              prueba: { select: { fechaHora: true, puntaje: true, completada: true } },
              etapas: {
                orderBy: { orden: "asc" },
                select: { id: true, orden: true, estado: true, decision: true, evaluador: { select: { nombre: true } } },
              },
            },
          },
        },
      },
      candidatos: {
        orderBy: { creadoEn: "desc" },
        include: {
          postulacion: {
            select: { nombre: true, apellido1: true, apellido2: true, rut: true, email: true, universidad: true, carrera: true },
          },
          prueba: true,
          etapas: {
            orderBy: { orden: "asc" },
            include: {
              evaluador: { select: { id: true, nombre: true } },
            },
          },
        },
      },
      _count: {
        select: { postulaciones: true, candidatos: true },
      },
    },
  })

  if (!proceso) {
    return NextResponse.json({ error: "Proceso no encontrado" }, { status: 404 })
  }

  return NextResponse.json(proceso)
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
    const { nombre, tipoProcesoId, descripcion, fechaInicio, fechaFin, estado } = body

    const proceso = await prisma.proceso.update({
      where: { id },
      data: {
        nombre: nombre?.trim(),
        tipoProcesoId,
        descripcion: descripcion?.trim() || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado: estado || undefined,
      },
      include: { tipoProceso: { select: { id: true, nombre: true } } },
    })

    return NextResponse.json(proceso)
  } catch (error) {
    console.error("Error al actualizar proceso:", error)
    return NextResponse.json({ error: "Error al actualizar proceso" }, { status: 500 })
  }
}
