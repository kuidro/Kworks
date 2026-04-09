import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatDate, getPuntajeLabel } from "@/lib/utils"

const estadoConfig = {
  EN_PROGRESO: { label: "En Progreso", class: "bg-blue-100 text-blue-700" },
  COMPLETADO: { label: "Completado", class: "bg-green-100 text-green-700" },
  TERMINADO: { label: "Terminado", class: "bg-red-100 text-red-700" },
}

const etapaEstadoConfig = {
  PENDIENTE: { label: "Pendiente", class: "bg-gray-100 text-gray-500" },
  ACTIVA: { label: "Activa", class: "bg-yellow-100 text-yellow-700" },
  COMPLETADA: { label: "Completada", class: "bg-green-100 text-green-700" },
}

export default async function ProcesoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  await auth()
  const { id } = await params

  const proceso = await prisma.procesoEvaluacion.findUnique({
    where: { id },
    include: {
      candidato: { include: { archivos: true } },
      etapas: {
        orderBy: { orden: "asc" },
        include: {
          evaluador: { select: { id: true, nombre: true, email: true } },
          competencias: { include: { competencia: true } },
        },
      },
    },
  })

  if (!proceso) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/candidatos" className="text-gray-400 hover:text-gray-600">← Candidatos</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/candidatos/${proceso.candidato.id}`} className="text-gray-400 hover:text-gray-600">{proceso.candidato.nombre}</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900 truncate">{proceso.titulo}</h1>
      </div>

      {/* Header del proceso */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{proceso.candidato.nombre}</h2>
            <p className="text-sm text-gray-500">{proceso.candidato.cargo || "Sin cargo"} · {proceso.candidato.email}</p>
          </div>
          <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${estadoConfig[proceso.estado].class}`}>
            {estadoConfig[proceso.estado].label}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          Iniciado el {formatDate(proceso.creadoEn)} · Última actualización {formatDate(proceso.actualizadoEn)}
        </div>
      </div>

      {/* Etapas */}
      <div className="space-y-4">
        {proceso.etapas.map((etapa) => {
          const puntajePromedio = etapa.competencias.length > 0
            ? etapa.competencias.filter(c => c.puntaje !== null).reduce((sum, c) => sum + (c.puntaje || 0), 0) /
              etapa.competencias.filter(c => c.puntaje !== null).length
            : null

          return (
            <div key={etapa.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Etapa header */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#f8f9fa" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "#1e3a5f" }}>
                    {etapa.orden}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{etapa.evaluador.nombre}</p>
                    <p className="text-xs text-gray-500">{etapa.evaluador.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {puntajePromedio !== null && (
                    <span className="text-sm font-semibold" style={{ color: "#1e3a5f" }}>
                      Promedio: {puntajePromedio.toFixed(1)}
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${etapaEstadoConfig[etapa.estado].class}`}>
                    {etapaEstadoConfig[etapa.estado].label}
                  </span>
                  {etapa.estado === "ACTIVA" && (
                    <Link href={`/evaluaciones/${etapa.id}`} className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: "#c9a84c" }}>
                      Ir a evaluar
                    </Link>
                  )}
                </div>
              </div>

              {/* Competencias */}
              {etapa.competencias.length > 0 && (
                <div className="px-6 py-4">
                  <div className="space-y-2">
                    {etapa.competencias.map((ec) => (
                      <div key={ec.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{ec.competencia.nombre}</span>
                        {ec.puntaje !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold" style={{ color: "#1e3a5f" }}>{ec.puntaje}/5</span>
                            <span className="text-xs text-gray-400">{getPuntajeLabel(ec.puntaje)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin evaluar</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {etapa.comentarioGeneral && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">Comentario general:</p>
                      <p className="text-sm text-gray-700">{etapa.comentarioGeneral}</p>
                    </div>
                  )}

                  {etapa.decision && (
                    <div className={`mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${etapa.decision === "AVANZA" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {etapa.decision === "AVANZA" ? "✓ Candidato Avanza" : "✗ Proceso Terminado"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
