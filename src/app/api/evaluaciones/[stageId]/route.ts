import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { procesarDecision } from "@/lib/automations"
import { z } from "zod"

const evaluacionSchema = z.object({
  competencias: z.array(
    z.object({
      etapaCompetenciaId: z.string(),
      puntaje: z.number().int().min(1).max(5),
      comentario: z.string().optional(),
    })
  ).min(1),
  comentarioGeneral: z.string().optional(),
  decision: z.enum(["AVANZA", "TERMINA"]),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ stageId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { stageId } = await params

  const etapa = await prisma.etapaEvaluacion.findUnique({
    where: { id: stageId },
    include: {
      evaluador: {
        select: { id: true, nombre: true, email: true },
      },
      competencias: {
        include: {
          competencia: true,
        },
      },
      proceso: {
        include: {
          candidato: true,
          etapas: {
            where: { estado: "COMPLETADA" },
            orderBy: { orden: "asc" },
            include: {
              evaluador: { select: { id: true, nombre: true } },
              competencias: {
                include: { competencia: true },
              },
            },
          },
        },
      },
    },
  })

  if (!etapa) {
    return NextResponse.json({ error: "Etapa no encontrada" }, { status: 404 })
  }

  // Solo el evaluador asignado o un admin pueden ver la etapa
  if (
    session.user.rol !== "ADMIN" &&
    etapa.evaluadorId !== session.user.id
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  return NextResponse.json(etapa)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ stageId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { stageId } = await params

  // Verificar que la etapa existe y el usuario es el evaluador
  const etapa = await prisma.etapaEvaluacion.findUnique({
    where: { id: stageId },
    include: {
      evaluador: true,
    },
  })

  if (!etapa) {
    return NextResponse.json({ error: "Etapa no encontrada" }, { status: 404 })
  }

  if (etapa.evaluadorId !== session.user.id) {
    return NextResponse.json({ error: "Solo el evaluador asignado puede completar esta etapa" }, { status: 403 })
  }

  if (etapa.estado !== "ACTIVA") {
    return NextResponse.json({ error: "Esta etapa no está activa" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = evaluacionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { competencias, comentarioGeneral, decision } = parsed.data

    // Actualizar puntajes y comentarios de competencias
    await Promise.all(
      competencias.map((comp) =>
        prisma.etapaCompetencia.update({
          where: { id: comp.etapaCompetenciaId },
          data: {
            puntaje: comp.puntaje,
            comentario: comp.comentario || null,
          },
        })
      )
    )

    // Marcar etapa como completada
    await prisma.etapaEvaluacion.update({
      where: { id: stageId },
      data: {
        estado: "COMPLETADA",
        decision,
        comentarioGeneral: comentarioGeneral || null,
        completadoEn: new Date(),
      },
    })

    // Procesar la decisión (activar siguiente etapa, etc.)
    await procesarDecision(stageId, decision)

    return NextResponse.json({ mensaje: "Evaluación guardada correctamente" })
  } catch (error) {
    console.error("Error al guardar evaluación:", error)
    return NextResponse.json({ error: "Error al guardar la evaluación" }, { status: 500 })
  }
}
