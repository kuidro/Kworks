"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface Candidato { id: string; nombre: string; cargo: string | null }
interface Usuario { id: string; nombre: string; email: string }
interface Competencia { id: string; nombre: string; descripcion: string | null }

interface EtapaForm {
  evaluadorId: string
  competenciaIds: string[]
}

function NuevoProcesoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const candidatoIdParam = searchParams.get("candidatoId") || ""

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [competencias, setCompetencias] = useState<Competencia[]>([])

  const [candidatoId, setCandidatoId] = useState(candidatoIdParam)
  const [titulo, setTitulo] = useState("")
  const [etapas, setEtapas] = useState<EtapaForm[]>([
    { evaluadorId: "", competenciaIds: [] },
    { evaluadorId: "", competenciaIds: [] },
  ])

  useEffect(() => {
    Promise.all([
      fetch("/api/candidatos").then((r) => r.json()),
      fetch("/api/usuarios").then((r) => r.json()),
      fetch("/api/competencias").then((r) => r.json()),
    ]).then(([c, u, comp]) => {
      setCandidatos(c)
      setUsuarios(u)
      setCompetencias(comp)
    })
  }, [])

  function addEtapa() {
    if (etapas.length < 4) setEtapas([...etapas, { evaluadorId: "", competenciaIds: [] }])
  }

  function removeEtapa(idx: number) {
    if (etapas.length > 2) setEtapas(etapas.filter((_, i) => i !== idx))
  }

  function setEvaluador(idx: number, evaluadorId: string) {
    const n = [...etapas]
    n[idx] = { ...n[idx], evaluadorId }
    setEtapas(n)
  }

  function toggleCompetencia(idx: number, compId: string) {
    const n = [...etapas]
    const ids = n[idx].competenciaIds
    n[idx] = {
      ...n[idx],
      competenciaIds: ids.includes(compId) ? ids.filter((id) => id !== compId) : [...ids, compId],
    }
    setEtapas(n)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!candidatoId) { setError("Seleccione un candidato"); return }
    if (!titulo.trim()) { setError("Ingrese un título para el proceso"); return }
    for (const [i, e] of etapas.entries()) {
      if (!e.evaluadorId) { setError(`Seleccione evaluador para la etapa ${i + 1}`); return }
      if (e.competenciaIds.length === 0) { setError(`Seleccione al menos una competencia para la etapa ${i + 1}`); return }
    }

    const evaluadoresUsados = new Set(etapas.map((e) => e.evaluadorId))
    if (evaluadoresUsados.size !== etapas.length) {
      setError("Cada evaluador debe ser diferente"); return
    }

    setLoading(true)
    const res = await fetch("/api/procesos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidatoId,
        titulo,
        etapas: etapas.map((e, i) => ({ evaluadorId: e.evaluadorId, orden: i + 1, competenciaIds: e.competenciaIds })),
      }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error?.message || "Error al crear el proceso")
    } else {
      const proceso = await res.json()
      router.push(`/procesos/${proceso.id}`)
    }
  }

  const candidatoSeleccionado = candidatos.find((c) => c.id === candidatoId)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/candidatos" className="text-gray-400 hover:text-gray-600 transition-colors">← Candidatos</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Proceso de Evaluación</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {["Candidato y Título", "Evaluadores y Competencias"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-gray-300" />}
            <div
              className={`flex items-center gap-2 cursor-pointer`}
              onClick={() => i < step - 1 && setStep(i + 1)}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? "text-white" : "text-gray-400 bg-gray-200"}`}
                style={step > i ? { background: "#1e3a5f" } : {}}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? "font-semibold text-gray-900" : "text-gray-400"}`}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Paso 1: Candidato y Título</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Candidato *</label>
                <select value={candidatoId} onChange={(e) => setCandidatoId(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 bg-white">
                  <option value="">Seleccionar candidato...</option>
                  {candidatos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}{c.cargo ? ` — ${c.cargo}` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del proceso *</label>
                <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required
                  placeholder={`Ej: Proceso ${candidatoSeleccionado?.nombre || "Candidato"} — ${new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" })}`}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => {
                  if (!candidatoId) { setError("Seleccione un candidato"); return }
                  if (!titulo.trim()) { setError("Ingrese un título"); return }
                  setError("")
                  setStep(2)
                }} className="px-6 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: "#1e3a5f" }}>
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Paso 2: Evaluadores y Competencias</h2>
              <p className="text-sm text-gray-500">Configure entre 2 y 4 evaluadores en orden secuencial.</p>

              {etapas.map((etapa, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Etapa {idx + 1}</h3>
                    {etapas.length > 2 && (
                      <button type="button" onClick={() => removeEtapa(idx)}
                        className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Evaluador</label>
                    <select value={etapa.evaluadorId} onChange={(e) => setEvaluador(idx, e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900 bg-white text-sm">
                      <option value="">Seleccionar evaluador...</option>
                      {usuarios.filter((u) => !etapas.some((e, i) => i !== idx && e.evaluadorId === u.id)).map((u) => (
                        <option key={u.id} value={u.id}>{u.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Competencias a evaluar</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {competencias.map((comp) => {
                        const checked = etapa.competenciaIds.includes(comp.id)
                        return (
                          <label key={comp.id} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-colors text-sm ${checked ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleCompetencia(idx, comp.id)} className="mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{comp.nombre}</span>
                          </label>
                        )
                      })}
                    </div>
                    {competencias.length === 0 && (
                      <p className="text-sm text-gray-400">No hay competencias. <Link href="/admin/competencias" className="text-blue-600 hover:underline">Crear competencias</Link></p>
                    )}
                  </div>
                </div>
              ))}

              {etapas.length < 4 && (
                <button type="button" onClick={addEtapa}
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                  + Agregar Etapa (máx. 4)
                </button>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  ← Anterior
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                  style={{ background: "#1e3a5f" }}>
                  {loading ? "Creando proceso..." : "Crear Proceso"}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}
      </form>
    </div>
  )
}

export default function NuevoProcesoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-400">Cargando...</div>}>
      <NuevoProcesoForm />
    </Suspense>
  )
}
