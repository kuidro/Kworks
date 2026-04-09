import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const competencias = await prisma.competencia.findMany({
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(competencias)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const data = schema.safeParse(body)
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 })

  const competencia = await prisma.competencia.create({ data: data.data })
  return NextResponse.json(competencia, { status: 201 })
}
