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

  const candidato = await prisma.candidato.findUnique({
    where: { id },
    include: {
      archivos: {
        orderBy: { subidoEn: "desc" },
      },
      procesos: {
        include: {
          etapas: {
            orderBy: { orden: "asc" },
            include: {
              evaluador: {
                select: { id: true, nombre: true, email: true },
              },
              competencias: {
                include: {
                  competencia: true,
                },
              },
            },
          },
        },
        orderBy: { creadoEn: "desc" },
      },
    },
  })

  if (!candidato) {
    return NextResponse.json({ error: "Candidato no encontrado" }, { status: 404 })
  }

  return NextResponse.json(candidato)
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
    await prisma.candidato.delete({ where: { id } })
    return NextResponse.json({ mensaje: "Candidato eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar candidato:", error)
    return NextResponse.json({ error: "Error al eliminar candidato" }, { status: 500 })
  }
}
