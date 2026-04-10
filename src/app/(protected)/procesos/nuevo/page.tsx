"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TipoProceso { id: string; nombre: string; descripcion: string | null }

export default function NuevoProcesoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tiposProceso, setTiposProceso] = useState<TipoProceso[]>([])

  const [nombre, setNombre] = useState("")
  const [tipoProcesoId, setTipoProcesoId] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [estado, setEstado] = useState("BORRADOR")

  useEffect(() => {
    fetch("/api/tipos-proceso").then((r) => r.json()).then(setTiposProceso)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!nombre.trim()) { setError("El nombre del proceso es requerido"); return }
    if (!tipoProcesoId) { setError("Seleccione un tipo de proceso"); return }

    setLoading(true)
    const res = await fetch("/api/procesos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre.trim(),
        tipoProcesoId,
        descripcion: descripcion.trim() || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        estado,
      }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al crear proceso")
    } else {
      const proceso = await res.json()
      router.push(`/procesos/${proceso.id}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/procesos" className="text-gray-400 hover:text-gray-600">← Procesos</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Proceso</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proceso *</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Analistas Junior 1er Semestre 2026"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de proceso *</label>
            {tiposProceso.length === 0 ? (
              <p className="text-sm text-gray-400">
                No hay tipos disponibles.{" "}
                <Link href="/admin/tipos-proceso" className="text-[#1e3a5f] hover:underline">Crear tipos →</Link>
              </p>
            ) : (
              <select
                value={tipoProcesoId}
                onChange={(e) => setTipoProcesoId(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 bg-white"
              >
                <option value="">Seleccionar...</option>
                {tiposProceso.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado inicial</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 bg-white"
            >
              <option value="BORRADOR">Borrador (no visible para postulantes)</option>
              <option value="ABIERTO">Abierto (visible en formulario de postulación)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del proceso, requisitos, etc."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha cierre</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Link href="/procesos" className="flex-1 text-center py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "#1e3a5f" }}
            >
              {loading ? "Creando..." : "Crear Proceso"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
