import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const estado = searchParams.get("estado")

  const postulaciones = await prisma.postulacion.findMany({
    where: {
      procesoId: id,
      ...(estado ? { estado: estado as "PENDIENTE" | "SELECCIONADO" | "DESCARTADO" } : {}),
    },
    orderBy: { creadoEn: "desc" },
    include: {
      candidatoEnProceso: {
        select: { id: true, estado: true },
      },
    },
  })

  return NextResponse.json(postulaciones)
}
