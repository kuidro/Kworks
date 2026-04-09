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

  const proceso = await prisma.procesoEvaluacion.findUnique({
    where: { id },
    include: {
      candidato: true,
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
  })

  if (!proceso) {
    return NextResponse.json({ error: "Proceso no encontrado" }, { status: 404 })
  }

  return NextResponse.json(proceso)
}
