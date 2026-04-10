"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Evaluador { id: string; nombre: string; email: string }
interface Competencia { id: string; nombre: string; descripcion: string | null }
interface EtapaCompetencia { id: string; puntaje: number | null; comentario: string | null; competencia: Competencia }
interface Etapa {
  id: string
  orden: number
  estado: "PENDIENTE" | "ACTIVA" | "COMPLETADA"
  decision: "AVANZA" | "TERMINA" | null
  comentarioGeneral: string | null
  completadoEn: string | null
  evaluador: Evaluador
  competencias: EtapaCompetencia[]
}
interface Prueba {
  id: string
  fechaHora: string | null
  puntaje: number | null
  observaciones: string | null
  completada: boolean
}
interface CandidatoDetalle {
  id: string
  estado: string
  notas: string | null
  creadoEn: string
  proceso: { id: string; nombre: string; tipoProceso: { nombre: string } }
  postulacion: {
    nombre: string; apellido1: string; apellido2: string | null
    rut: string; email: string; universidad: string; carrera: string
    rankingNotas: string | null; cvNombre: string | null
    respuesta1: string; respuesta2: string
  }
  prueba: Prueba | null
  etapas: Etapa[]
}

const etapaEstadoConf = {
  PENDIENTE: { label: "Pendiente", clase: "bg-gray-100 text-gray-500" },
  ACTIVA: { label: "Activa", clase: "bg-yellow-100 text-yellow-700" },
  COMPLETADA: { label: "Completada", clase: "bg-green-100 text-green-700" },
}

function getPuntajeLabel(p: number) {
  return ["", "Muy bajo", "Bajo", "Adecuado", "Bueno", "Excelente"][p] || ""
}

export default function CandidatoProcesoPage() {
  const params = useParams()
  const router = useRouter()
  const candidatoId = params.id as string

  const [candidato, setCandidato] = useState<CandidatoDetalle | null>(null)
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"info" | "prueba" | "etapas">("info")

  // Prueba form
  const [fechaHora, setFechaHora] = useState("")
  const [puntaje, setPuntaje] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [completada, setCompletada] = useState(false)
  const [savingPrueba, setSavingPrueba] = useState(false)

  // Etapas assignment
  const [asignando, setAsignando] = useState(false)
  const [etapaEvals, setEtapaEvals] = useState<string[]>(["", ""])

  const cargar = useCallback(async () => {
    const [cRes, eRes] = await Promise.all([
      fetch(`/api/candidatos-proceso/${candidatoId}`),
      fetch("/api/usuarios"),
    ])
    const cData = await cRes.json()
    const eData = await eRes.json()
    setCandidato(cData)
    setEvaluadores(eData)
    if (cData.prueba) {
      setFechaHora(cData.prueba.fechaHora ? cData.prueba.fechaHora.slice(0, 16) : "")
      setPuntaje(cData.prueba.puntaje !== null ? String(cData.prueba.puntaje) : "")
      setObservaciones(cData.prueba.observaciones || "")
      setCompletada(cData.prueba.completada)
    }
    setLoading(false)
  }, [candidatoId])

  useEffect(() => { cargar() }, [cargar])

  async function guardarPrueba() {
    setSavingPrueba(true)
    await fetch(`/api/candidatos-proceso/${candidatoId}/prueba`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fechaHora: fechaHora || null,
        puntaje: puntaje !== "" ? parseFloat(puntaje) : null,
        observaciones: observaciones || null,
        completada,
      }),
    })
    setSavingPrueba(false)
    cargar()
  }

  async function asignarEtapas() {
    const filled = etapaEvals.filter(Boolean)
    if (filled.length < 2) { alert("Se requieren al menos 2 evaluadores"); return }
    setAsignando(true)
    await fetch(`/api/candidatos-proceso/${candidatoId}/etapas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evaluadores: filled.map((evaluadorId, i) => ({ evaluadorId, orden: i + 1 })),
      }),
    })
    setAsignando(false)
    cargar()
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Cargando...</div>
  if (!candidato) return <div className="text-center py-20 text-gray-400">Candidato no encontrado</div>

  const post = candidato.postulacion
  const nombreCompleto = `${post.nombre} ${post.apellido1}${post.apellido2 ? " " + post.apellido2 : ""}`

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">←</button>
        <Link href={`/procesos/${candidato.proceso.id}`} className="text-gray-400 hover:text-gray-600 truncate">
          {candidato.proceso.nombre}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900 truncate">{nombreCompleto}</h1>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{nombreCompleto}</h2>
            <p className="text-sm text-gray-500 mt-1">{post.carrera} · {post.universidad}</p>
            <p className="text-xs text-gray-400 mt-0.5">{post.rut} · {post.email}</p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            candidato.estado === "COMPLETADO" ? "bg-green-100 text-green-700" :
            candidato.estado === "DESCARTADO" ? "bg-red-100 text-red-600" :
            candidato.estado === "EN_ENTREVISTAS" ? "bg-yellow-100 text-yellow-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {candidato.estado.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {(["info", "prueba", "etapas"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "info" ? "Información" : t === "prueba" ? "Prueba Online" : "Etapas"}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === "info" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Formación</p>
            <p className="text-gray-700">{post.carrera}</p>
            <p className="text-gray-500 text-sm">{post.universidad}</p>
            {post.rankingNotas && <p className="text-sm text-gray-400 mt-1">Ranking: {post.rankingNotas}</p>}
          </div>

          {post.cvNombre && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Curriculum Vitae</p>
              <p className="text-sm text-blue-600">{post.cvNombre}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pregunta 1</p>
            <p className="text-gray-600 text-sm leading-relaxed">{post.respuesta1}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pregunta 2</p>
            <p className="text-gray-600 text-sm leading-relaxed">{post.respuesta2}</p>
          </div>
        </div>
      )}

      {/* Prueba tab */}
      {tab === "prueba" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Prueba Online</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
              <input
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puntaje</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={puntaje}
                onChange={(e) => setPuntaje(e.target.value)}
                placeholder="0 — 100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={completada} onChange={(e) => setCompletada(e.target.checked)} />
            <span className="text-sm text-gray-700">Prueba completada</span>
          </label>

          <button
            onClick={guardarPrueba}
            disabled={savingPrueba}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "#1e3a5f" }}
          >
            {savingPrueba ? "Guardando..." : "Guardar Prueba"}
          </button>
        </div>
      )}

      {/* Etapas tab */}
      {tab === "etapas" && (
        <div className="space-y-4">
          {candidato.etapas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Asignar Evaluadores</h3>
              <p className="text-sm text-gray-500 mb-4">Asigna entre 2 y 4 evaluadores en orden secuencial.</p>

              {etapaEvals.map((evalId, idx) => (
                <div key={idx} className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "#1e3a5f" }}>
                    {idx + 1}
                  </span>
                  <select
                    value={evalId}
                    onChange={(e) => {
                      const n = [...etapaEvals]
                      n[idx] = e.target.value
                      setEtapaEvals(n)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-900 bg-white"
                  >
                    <option value="">Seleccionar evaluador...</option>
                    {evaluadores.filter((e) => !etapaEvals.some((id, i) => i !== idx && id === e.id)).map((e) => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                  {etapaEvals.length > 2 && (
                    <button
                      onClick={() => setEtapaEvals(etapaEvals.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {etapaEvals.length < 4 && (
                <button
                  onClick={() => setEtapaEvals([...etapaEvals, ""])}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:border-gray-400 hover:text-gray-500 mb-4"
                >
                  + Agregar etapa (máx. 4)
                </button>
              )}

              <button
                onClick={asignarEtapas}
                disabled={asignando}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: "#1e3a5f" }}
              >
                {asignando ? "Asignando..." : "Asignar Evaluadores y Activar"}
              </button>
            </div>
          ) : (
            <>
              {candidato.etapas.map((etapa) => {
                const puntajePromedio = etapa.competencias.length > 0
                  ? etapa.competencias.filter((c) => c.puntaje !== null).reduce((s, c) => s + (c.puntaje || 0), 0) /
                    Math.max(etapa.competencias.filter((c) => c.puntaje !== null).length, 1)
                  : null

                return (
                  <div key={etapa.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between bg-gray-50">
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
                        {puntajePromedio !== null && etapa.competencias.filter((c) => c.puntaje !== null).length > 0 && (
                          <span className="text-sm font-semibold" style={{ color: "#1e3a5f" }}>
                            Prom. {puntajePromedio.toFixed(1)}
                          </span>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${etapaEstadoConf[etapa.estado].clase}`}>
                          {etapaEstadoConf[etapa.estado].label}
                        </span>
                        {etapa.estado === "ACTIVA" && (
                          <Link href={`/evaluaciones/${etapa.id}`} className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: "#c9a84c" }}>
                            Ir a evaluar
                          </Link>
                        )}
                      </div>
                    </div>

                    {etapa.estado === "COMPLETADA" && etapa.competencias.length > 0 && (
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
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {etapa.comentarioGeneral && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
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
            </>
          )}
        </div>
      )}
    </div>
  )
}
