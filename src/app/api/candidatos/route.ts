import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const candidatoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  cargo: z.string().optional(),
  linkedin: z.string().optional(),
  notas: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("q") || ""

  const candidatos = await prisma.candidato.findMany({
    where: search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { cargo: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      _count: {
        select: { procesos: true, archivos: true },
      },
    },
    orderBy: { creadoEn: "desc" },
  })

  return NextResponse.json(candidatos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = candidatoSchema.safeParse(body)

    if (!data.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: data.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const candidato = await prisma.candidato.create({
      data: data.data,
    })

    return NextResponse.json(candidato, { status: 201 })
  } catch (error) {
    console.error("Error al crear candidato:", error)
    return NextResponse.json({ error: "Error al crear candidato" }, { status: 500 })
  }
}
