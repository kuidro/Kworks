"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import PuntajeSelector from "@/components/PuntajeSelector"
import EvaluacionAnteriorCard from "@/components/EvaluacionAnteriorCard"

interface EtapaCompetencia {
  id: string
  puntaje: number | null
  comentario: string | null
  competencia: { id: string; nombre: string; descripcion: string | null }
}

interface EtapaAnterior {
  id: string
  orden: number
  evaluador: { nombre: string }
  decision: string | null
  comentarioGeneral: string | null
  competencias: EtapaCompetencia[]
}

interface EtapaData {
  id: string
  orden: number
  estado: string
  evaluadorId: string
  evaluador: { id: string; nombre: string; email: string }
  competencias: EtapaCompetencia[]
  comentarioGeneral: string | null
  decision: string | null
  proceso: {
    titulo: string
    candidato: { nombre: string; cargo: string | null; email: string }
    etapas: EtapaAnterior[]
  }
}

export default function EvaluacionPage() {
  const params = useParams()
  const router = useRouter()
  const stageId = params.stageId as string

  const [etapa, setEtapa] = useState<EtapaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [confirmacion, setConfirmacion] = useState<"AVANZA" | "TERMINA" | null>(null)

  const [puntajes, setPuntajes] = useState<Record<string, number>>({})
  const [comentarios, setComentarios] = useState<Record<string, string>>({})
  const [comentarioGeneral, setComentarioGeneral] = useState("")

  useEffect(() => {
    fetch(`/api/evaluaciones/${stageId}`)
      .then((r) => {
        if (!r.ok) throw new Error("No autorizado")
        return r.json()
      })
      .then((data) => {
        setEtapa(data)
        setLoading(false)
      })
      .catch(() => {
        setError("No tienes acceso a esta evaluación o no existe.")
        setLoading(false)
      })
  }, [stageId])

  async function enviarEvaluacion(decision: "AVANZA" | "TERMINA") {
    if (!etapa) return
    setError("")

    // Validar que todos los puntajes estén asignados
    const sinPuntaje = etapa.competencias.filter((c) => !puntajes[c.id])
    if (sinPuntaje.length > 0) {
      setError(`Debe calificar todas las competencias. Faltan: ${sinPuntaje.map(c => c.competencia.nombre).join(", ")}`)
      setConfirmacion(null)
      return
    }

    setSubmitting(true)
    setConfirmacion(null)

    const payload = {
      competencias: etapa.competencias.map((c) => ({
        etapaCompetenciaId: c.id,
        puntaje: puntajes[c.id],
        comentario: comentarios[c.id] || undefined,
      })),
      comentarioGeneral: comentarioGeneral || undefined,
      decision,
    }

    const res = await fetch(`/api/evaluaciones/${stageId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setSubmitting(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al guardar la evaluación")
    } else {
      router.push("/dashboard")
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Cargando evaluación...</div>
  if (error && !etapa) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">{error}</div>
    </div>
  )
  if (!etapa) return null

  const esActiva = etapa.estado === "ACTIVA"
  const etapasAnteriores = etapa.proceso.etapas.filter((e) => e.orden < etapa.orden)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{etapa.proceso.candidato.nombre}</h1>
            <p className="text-gray-500 mt-1">
              {etapa.proceso.candidato.cargo || "Sin cargo"} · {etapa.proceso.titulo}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              Etapa {etapa.orden} — Evaluador: {etapa.evaluador.nombre}
            </p>
          </div>
          <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
            etapa.estado === "ACTIVA" ? "bg-yellow-100 text-yellow-700" :
            etapa.estado === "COMPLETADA" ? "bg-green-100 text-green-700" :
            "bg-gray-100 text-gray-500"
          }`}>
            {etapa.estado === "ACTIVA" ? "Pendiente" : etapa.estado === "COMPLETADA" ? "Completada" : "Pendiente"}
          </span>
        </div>
      </div>

      {/* Evaluaciones anteriores (read-only) */}
      {etapasAnteriores.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Evaluaciones Previas</h2>
          <div className="space-y-3">
            {etapasAnteriores.map((etapaAnterior) => (
              <EvaluacionAnteriorCard
                key={etapaAnterior.id}
                orden={etapaAnterior.orden}
                evaluadorNombre={etapaAnterior.evaluador.nombre}
                competencias={etapaAnterior.competencias}
                comentarioGeneral={etapaAnterior.comentarioGeneral}
                decision={etapaAnterior.decision as "AVANZA" | "TERMINA" | null}
                completadoEn={null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Formulario de evaluación */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">
          {esActiva ? "Tu Evaluación" : "Evaluación Registrada"}
        </h2>

        <div className="space-y-6">
          {etapa.competencias.map((ec) => (
            <div key={ec.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{ec.competencia.nombre}</h3>
                  {ec.competencia.descripcion && (
                    <p className="text-sm text-gray-400 mt-0.5">{ec.competencia.descripcion}</p>
                  )}
                </div>
              </div>

              <PuntajeSelector
                value={esActiva ? (puntajes[ec.id] || null) : (ec.puntaje || null)}
                onChange={(v) => setPuntajes({ ...puntajes, [ec.id]: v })}
                disabled={!esActiva}
              />

              {(esActiva || ec.comentario) && (
                <div className="mt-3">
                  <textarea
                    disabled={!esActiva}
                    value={esActiva ? (comentarios[ec.id] || "") : (ec.comentario || "")}
                    onChange={(e) => setComentarios({ ...comentarios, [ec.id]: e.target.value })}
                    placeholder="Comentario sobre esta competencia (opcional)..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 text-gray-700 placeholder-gray-400 resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comentario general */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comentario General</label>
          <textarea
            disabled={!esActiva}
            value={esActiva ? comentarioGeneral : (etapa.comentarioGeneral || "")}
            onChange={(e) => setComentarioGeneral(e.target.value)}
            placeholder="Observaciones generales sobre el candidato..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 text-gray-700 placeholder-gray-400 resize-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Botones de decisión */}
        {esActiva && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-4">Decisión Final</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setConfirmacion("AVANZA")}
                className="py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "#16a34a" }}
              >
                ✓ Candidato Avanza
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setConfirmacion("TERMINA")}
                className="py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "#dc2626" }}
              >
                ✗ Terminar Proceso
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {confirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmacion === "AVANZA" ? "¿Confirmar Avance?" : "¿Terminar Proceso?"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmacion === "AVANZA"
                ? `El candidato ${etapa.proceso.candidato.nombre} avanzará a la siguiente etapa del proceso.`
                : `El proceso de evaluación de ${etapa.proceso.candidato.nombre} se cerrará como terminado. Se notificará al candidato.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmacion(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => enviarEvaluacion(confirmacion)} disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: confirmacion === "AVANZA" ? "#16a34a" : "#dc2626" }}>
                {submitting ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
