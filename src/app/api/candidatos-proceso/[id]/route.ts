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

  const candidato = await prisma.candidatoEnProceso.findUnique({
    where: { id },
    include: {
      proceso: {
        select: { id: true, nombre: true, tipoProceso: { select: { nombre: true } } },
      },
      postulacion: true,
      prueba: true,
      etapas: {
        orderBy: { orden: "asc" },
        include: {
          evaluador: { select: { id: true, nombre: true, email: true } },
          competencias: {
            include: { competencia: true },
          },
        },
      },
    },
  })

  if (!candidato) {
    return NextResponse.json({ error: "Candidato no encontrado" }, { status: 404 })
  }

  return NextResponse.json(candidato)
}

export async function PATCH(
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
    const { notas, estado } = body

    const candidato = await prisma.candidatoEnProceso.update({
      where: { id },
      data: {
        ...(notas !== undefined ? { notas } : {}),
        ...(estado ? { estado } : {}),
      },
    })

    return NextResponse.json(candidato)
  } catch (error) {
    console.error("Error al actualizar candidato:", error)
    return NextResponse.json({ error: "Error al actualizar candidato" }, { status: 500 })
  }
}
