"use client"

import { useState, useEffect } from "react"

interface Proceso {
  id: string
  nombre: string
  descripcion: string | null
  tipoProceso: { nombre: string }
}

type Step = 1 | 2 | 3

export default function PostularPage() {
  const [step, setStep] = useState<Step>(1)
  const [procesos, setProcesos] = useState<Proceso[]>([])
  const [loadingProcesos, setLoadingProcesos] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [procesoId, setProcesoId] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido1, setApellido1] = useState("")
  const [apellido2, setApellido2] = useState("")
  const [rut, setRut] = useState("")
  const [email, setEmail] = useState("")
  const [universidad, setUniversidad] = useState("")
  const [carrera, setCarrera] = useState("")
  const [rankingNotas, setRankingNotas] = useState("")
  const [respuesta1, setRespuesta1] = useState("")
  const [respuesta2, setRespuesta2] = useState("")
  const [cv, setCv] = useState<File | null>(null)

  useEffect(() => {
    fetch("/api/postular/procesos")
      .then((r) => r.json())
      .then((data) => {
        setProcesos(Array.isArray(data) ? data : [])
        setLoadingProcesos(false)
      })
      .catch(() => setLoadingProcesos(false))
  }, [])

  function validarStep1() {
    if (!procesoId) { setError("Seleccione el proceso al que desea postular"); return false }
    if (!nombre.trim()) { setError("El nombre es requerido"); return false }
    if (!apellido1.trim()) { setError("El primer apellido es requerido"); return false }
    if (!rut.trim()) { setError("El RUT es requerido"); return false }
    if (!email.trim() || !email.includes("@")) { setError("El correo electrónico no es válido"); return false }
    return true
  }

  function validarStep2() {
    if (!universidad.trim()) { setError("La universidad es requerida"); return false }
    if (!carrera.trim()) { setError("La carrera es requerida"); return false }
    return true
  }

  function siguientePaso() {
    setError("")
    if (step === 1 && !validarStep1()) return
    if (step === 2 && !validarStep2()) return
    setStep((s) => (s + 1) as Step)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!respuesta1.trim()) { setError("La primera respuesta es requerida"); return }
    if (!respuesta2.trim()) { setError("La segunda respuesta es requerida"); return }

    setSubmitting(true)

    const formData = new FormData()
    formData.append("procesoId", procesoId)
    formData.append("nombre", nombre.trim())
    formData.append("apellido1", apellido1.trim())
    if (apellido2.trim()) formData.append("apellido2", apellido2.trim())
    formData.append("rut", rut.trim())
    formData.append("email", email.trim())
    formData.append("universidad", universidad.trim())
    formData.append("carrera", carrera.trim())
    if (rankingNotas.trim()) formData.append("rankingNotas", rankingNotas.trim())
    formData.append("respuesta1", respuesta1.trim())
    formData.append("respuesta2", respuesta2.trim())
    if (cv) formData.append("cv", cv)

    const res = await fetch("/api/postular", { method: "POST", body: formData })
    setSubmitting(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al enviar la postulación")
    } else {
      setExito(true)
    }
  }

  const procesoSeleccionado = procesos.find((p) => p.id === procesoId)

  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f8f9fa" }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e8f4e8" }}>
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Postulación Enviada!</h2>
          <p className="text-gray-500">
            Tu postulación ha sido recibida correctamente. Te contactaremos al correo <strong>{email}</strong> con los próximos pasos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "#f8f9fa" }}>
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#1e3a5f" }}>
            <span className="text-[#c9a84c] font-bold text-sm">MB</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">Montblanc Consulting</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Formulario de Postulación</h1>
        <p className="text-gray-500">Completa el formulario para iniciar tu proceso de selección</p>
      </div>

      {/* Stepper */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-center gap-2">
          {(["Datos Personales", "Formación", "Preguntas"] as const).map((label, i) => {
            const n = i + 1
            const activo = step === n
            const completado = step > n
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && <div className={`w-12 h-px ${completado ? "" : "bg-gray-200"}`} style={completado ? { background: "#1e3a5f" } : {}} />}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={completado || activo ? { background: "#1e3a5f", color: "#fff" } : { background: "#e5e7eb", color: "#9ca3af" }}
                  >
                    {completado ? "✓" : n}
                  </div>
                  <span className={`text-sm hidden sm:block ${activo ? "font-semibold text-gray-900" : "text-gray-400"}`}>{label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); siguientePaso() }}>
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Step 1: Datos personales */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Datos Personales</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proceso al que postula *</label>
                {loadingProcesos ? (
                  <p className="text-sm text-gray-400">Cargando procesos disponibles...</p>
                ) : procesos.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay procesos disponibles en este momento.</p>
                ) : (
                  <select
                    value={procesoId}
                    onChange={(e) => setProcesoId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 bg-white"
                  >
                    <option value="">Seleccionar proceso...</option>
                    {procesos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre} — {p.tipoProceso.nombre}</option>
                    ))}
                  </select>
                )}
                {procesoSeleccionado?.descripcion && (
                  <p className="text-xs text-gray-400 mt-1">{procesoSeleccionado.descripcion}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Juan"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primer apellido *</label>
                  <input value={apellido1} onChange={(e) => setApellido1(e.target.value)} required placeholder="Pérez"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segundo apellido</label>
                  <input value={apellido2} onChange={(e) => setApellido2(e.target.value)} placeholder="García"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
                  <input value={rut} onChange={(e) => setRut(e.target.value)} required placeholder="12.345.678-9"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Formación */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Formación Académica</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Universidad *</label>
                <input value={universidad} onChange={(e) => setUniversidad(e.target.value)} required placeholder="Universidad de Chile"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
                <input value={carrera} onChange={(e) => setCarrera(e.target.value)} required placeholder="Ingeniería Comercial"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ranking de notas</label>
                <input value={rankingNotas} onChange={(e) => setRankingNotas(e.target.value)} placeholder="Ej: Top 10%"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
                <p className="text-xs text-gray-400 mt-1">Opcional. Ej: Top 5%, Percentil 90, etc.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curriculum Vitae (PDF)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCv(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white file:cursor-pointer"
                  style={{ "--file-bg": "#1e3a5f" } as React.CSSProperties}
                />
                <p className="text-xs text-gray-400 mt-1">Opcional. Máximo 10MB. Formatos: PDF, DOC, DOCX.</p>
              </div>
            </>
          )}

          {/* Step 3: Preguntas */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Preguntas de Postulación</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. ¿Por qué te interesa este proceso y qué te distingue de otros candidatos? *
                </label>
                <textarea
                  value={respuesta1}
                  onChange={(e) => setRespuesta1(e.target.value)}
                  required
                  rows={5}
                  placeholder="Cuéntanos sobre tu motivación y lo que te hace un candidato destacado..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-900 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{respuesta1.length} caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Describe una situación en que hayas enfrentado un desafío importante y cómo lo resolviste. *
                </label>
                <textarea
                  value={respuesta2}
                  onChange={(e) => setRespuesta2(e.target.value)}
                  required
                  rows={5}
                  placeholder="Describe el desafío, las acciones que tomaste y el resultado obtenido..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-900 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{respuesta2.length} caracteres</p>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button type="button" onClick={() => { setError(""); setStep((s) => (s - 1) as Step) }}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                ← Anterior
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "#1e3a5f" }}
            >
              {step < 3 ? "Siguiente →" : submitting ? "Enviando..." : "Enviar Postulación"}
            </button>
          </div>
        </div>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} Montblanc Consulting · Todos los derechos reservados
      </p>
    </div>
  )
}
