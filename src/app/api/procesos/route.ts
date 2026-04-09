import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { activarEtapa } from "@/lib/automations"
import { z } from "zod"

const etapaSchema = z.object({
  evaluadorId: z.string().min(1),
  orden: z.number().int().positive(),
  competenciaIds: z.array(z.string()).min(1, "Debe seleccionar al menos una competencia"),
})

const procesoSchema = z.object({
  candidatoId: z.string().min(1, "Debe seleccionar un candidato"),
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  etapas: z.array(etapaSchema).min(1, "Debe agregar al menos una etapa"),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get("estado")

  const procesos = await prisma.procesoEvaluacion.findMany({
    where: estado ? { estado: estado as "EN_PROGRESO" | "COMPLETADO" | "TERMINADO" } : undefined,
    include: {
      candidato: {
        select: { id: true, nombre: true, email: true, cargo: true },
      },
      etapas: {
        orderBy: { orden: "asc" },
        include: {
          evaluador: { select: { id: true, nombre: true } },
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
    const parsed = procesoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { candidatoId, titulo, etapas } = parsed.data

    // Verificar candidato
    const candidato = await prisma.candidato.findUnique({ where: { id: candidatoId } })
    if (!candidato) {
      return NextResponse.json({ error: "Candidato no encontrado" }, { status: 404 })
    }

    // Crear proceso con etapas
    const proceso = await prisma.procesoEvaluacion.create({
      data: {
        candidatoId,
        titulo,
        etapas: {
          create: etapas.map((etapa) => ({
            evaluadorId: etapa.evaluadorId,
            orden: etapa.orden,
            estado: "PENDIENTE",
            competencias: {
              create: etapa.competenciaIds.map((competenciaId) => ({
                competenciaId,
              })),
            },
          })),
        },
      },
      include: {
        etapas: {
          orderBy: { orden: "asc" },
        },
      },
    })

    // Activar la primera etapa
    const primeraEtapa = proceso.etapas.find((e) => e.orden === 1)
    if (primeraEtapa) {
      await activarEtapa(primeraEtapa.id)
    }

    return NextResponse.json(proceso, { status: 201 })
  } catch (error) {
    console.error("Error al crear proceso:", error)
    return NextResponse.json({ error: "Error al crear proceso" }, { status: 500 })
  }
}
