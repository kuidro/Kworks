import { prisma } from "@/lib/db"
import {
  sendEmail,
  templateEtapaActivada,
  templateCandidatoAvanza,
  templateProcesoTerminado,
  templateProcesoCompletado,
  templateAdminRechazo,
} from "@/lib/email"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export async function activarEtapa(etapaId: string): Promise<void> {
  const etapa = await prisma.etapaEvaluacion.update({
    where: { id: etapaId },
    data: { estado: "ACTIVA" },
    include: {
      evaluador: true,
      proceso: {
        include: {
          candidato: true,
        },
      },
    },
  })

  const etapaUrl = `${BASE_URL}/evaluaciones/${etapaId}`

  await sendEmail(
    etapa.evaluador.email,
    `Nueva evaluación asignada: ${etapa.proceso.candidato.nombre}`,
    templateEtapaActivada(
      etapa.evaluador.nombre,
      etapa.proceso.candidato.nombre,
      etapaUrl
    )
  )
}

export async function procesarDecision(
  etapaId: string,
  decision: "AVANZA" | "TERMINA"
): Promise<void> {
  const etapa = await prisma.etapaEvaluacion.findUnique({
    where: { id: etapaId },
    include: {
      evaluador: true,
      proceso: {
        include: {
          candidato: true,
          etapas: {
            orderBy: { orden: "asc" },
            include: {
              evaluador: true,
            },
          },
        },
      },
    },
  })

  if (!etapa) {
    throw new Error("Etapa no encontrada")
  }

  const proceso = etapa.proceso
  const candidato = proceso.candidato
  const todasEtapas = proceso.etapas
  const etapaActual = todasEtapas.find((e) => e.id === etapaId)

  if (!etapaActual) {
    throw new Error("Etapa actual no encontrada en el proceso")
  }

  if (decision === "AVANZA") {
    const siguienteEtapa = todasEtapas.find(
      (e) => e.orden === etapaActual.orden + 1
    )

    if (siguienteEtapa) {
      const etapaUrl = `${BASE_URL}/evaluaciones/${siguienteEtapa.id}`

      await prisma.etapaEvaluacion.update({
        where: { id: siguienteEtapa.id },
        data: { estado: "ACTIVA" },
      })

      await sendEmail(
        siguienteEtapa.evaluador.email,
        `Candidato avanza: ${candidato.nombre}`,
        templateCandidatoAvanza(
          siguienteEtapa.evaluador.nombre,
          candidato.nombre,
          etapaUrl
        )
      )
    } else {
      await prisma.procesoEvaluacion.update({
        where: { id: proceso.id },
        data: { estado: "COMPLETADO" },
      })

      const cargo = candidato.cargo || "sin especificar"
      await sendEmail(
        candidato.email,
        "¡Felicitaciones! Ha completado el proceso de evaluación",
        templateProcesoCompletado(candidato.nombre, cargo)
      )
    }
  } else if (decision === "TERMINA") {
    await prisma.procesoEvaluacion.update({
      where: { id: proceso.id },
      data: { estado: "TERMINADO" },
    })

    const cargo = candidato.cargo || "sin especificar"

    await sendEmail(
      candidato.email,
      "Resultado de su proceso de evaluación",
      templateProcesoTerminado(candidato.nombre, cargo)
    )

    const adminUsuarios = await prisma.usuario.findMany({
      where: { rol: "ADMIN" },
    })

    for (const admin of adminUsuarios) {
      await sendEmail(
        admin.email,
        `Proceso terminado: ${candidato.nombre}`,
        templateAdminRechazo(candidato.nombre, etapa.evaluador.nombre)
      )
    }
  }
}
