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
      candidatoEnProceso: {
        include: {
          postulacion: true,
        },
      },
    },
  })

  const postulacion = etapa.candidatoEnProceso.postulacion
  const candidatoNombre = `${postulacion.nombre} ${postulacion.apellido1}`
  const etapaUrl = `${BASE_URL}/evaluaciones/${etapaId}`

  await sendEmail(
    etapa.evaluador.email,
    `Nueva evaluación asignada: ${candidatoNombre}`,
    templateEtapaActivada(
      etapa.evaluador.nombre,
      candidatoNombre,
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
      candidatoEnProceso: {
        include: {
          postulacion: true,
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

  const candidatoEnProceso = etapa.candidatoEnProceso
  const postulacion = candidatoEnProceso.postulacion
  const candidatoNombre = `${postulacion.nombre} ${postulacion.apellido1}`
  const todasEtapas = candidatoEnProceso.etapas
  const etapaActual = todasEtapas.find((e) => e.id === etapaId)

  if (!etapaActual) {
    throw new Error("Etapa actual no encontrada en el candidato")
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
        `Candidato avanza: ${candidatoNombre}`,
        templateCandidatoAvanza(
          siguienteEtapa.evaluador.nombre,
          candidatoNombre,
          etapaUrl
        )
      )
    } else {
      // Última etapa completada → candidato COMPLETADO
      await prisma.candidatoEnProceso.update({
        where: { id: candidatoEnProceso.id },
        data: { estado: "COMPLETADO" },
      })

      await sendEmail(
        postulacion.email,
        "¡Felicitaciones! Ha completado el proceso de evaluación",
        templateProcesoCompletado(candidatoNombre, postulacion.carrera)
      )
    }
  } else if (decision === "TERMINA") {
    await prisma.candidatoEnProceso.update({
      where: { id: candidatoEnProceso.id },
      data: { estado: "DESCARTADO" },
    })

    await sendEmail(
      postulacion.email,
      "Resultado de su proceso de evaluación",
      templateProcesoTerminado(candidatoNombre, postulacion.carrera)
    )

    const adminUsuarios = await prisma.usuario.findMany({
      where: { rol: "ADMIN" },
    })

    for (const admin of adminUsuarios) {
      await sendEmail(
        admin.email,
        `Proceso terminado: ${candidatoNombre}`,
        templateAdminRechazo(candidatoNombre, etapa.evaluador.nombre)
      )
    }
  }
}
