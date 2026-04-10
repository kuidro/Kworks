import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { activarEtapa } from "@/lib/automations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const etapas = await prisma.etapaEvaluacion.findMany({
    where: { candidatoEnProcesoId: id },
    orderBy: { orden: "asc" },
    include: {
      evaluador: { select: { id: true, nombre: true, email: true } },
      competencias: { include: { competencia: true } },
    },
  })

  return NextResponse.json(etapas)
}

export async function POST(
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
    const { evaluadores } = body
    // evaluadores: Array<{ evaluadorId: string; orden: number }>

    if (!Array.isArray(evaluadores) || evaluadores.length < 2 || evaluadores.length > 4) {
      return NextResponse.json({ error: "Se requieren entre 2 y 4 evaluadores" }, { status: 400 })
    }

    // Verify candidato exists
    const candidato = await prisma.candidatoEnProceso.findUnique({
      where: { id },
    })

    if (!candidato) {
      return NextResponse.json({ error: "Candidato no encontrado" }, { status: 404 })
    }

    // Get all competencias
    const competencias = await prisma.competencia.findMany()

    // Delete existing stages if any (re-assignment)
    await prisma.etapaEvaluacion.deleteMany({
      where: { candidatoEnProcesoId: id },
    })

    // Create new stages
    const etapasCreadas = await Promise.all(
      evaluadores.map(async (ev: { evaluadorId: string; orden: number }) => {
        const etapa = await prisma.etapaEvaluacion.create({
          data: {
            candidatoEnProcesoId: id,
            evaluadorId: ev.evaluadorId,
            orden: ev.orden,
            estado: "PENDIENTE",
            competencias: {
              create: competencias.map((comp) => ({
                competenciaId: comp.id,
              })),
            },
          },
        })
        return etapa
      })
    )

    // Update candidato estado to EN_ENTREVISTAS
    await prisma.candidatoEnProceso.update({
      where: { id },
      data: { estado: "EN_ENTREVISTAS" },
    })

    // Activate first stage
    const primeraEtapa = etapasCreadas.sort((a, b) => a.orden - b.orden)[0]
    await activarEtapa(primeraEtapa.id)

    return NextResponse.json({ mensaje: "Etapas asignadas correctamente", etapas: etapasCreadas }, { status: 201 })
  } catch (error) {
    console.error("Error al asignar etapas:", error)
    return NextResponse.json({ error: "Error al asignar etapas" }, { status: 500 })
  }
}
