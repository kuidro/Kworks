import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const procesos = await prisma.proceso.findMany({
    where: { estado: "ABIERTO" },
    include: {
      tipoProceso: { select: { id: true, nombre: true } },
    },
    orderBy: { creadoEn: "desc" },
  })

  return NextResponse.json(procesos)
}
