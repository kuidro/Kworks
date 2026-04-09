"use client"

import { useState, useEffect } from "react"

interface Competencia { id: string; nombre: string; descripcion: string | null }

export default function CompetenciasPage() {
  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [editando, setEditando] = useState<Competencia | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchCompetencias = async () => {
    const res = await fetch("/api/competencias")
    if (res.ok) setCompetencias(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchCompetencias() }, [])

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!nombre.trim()) { setError("El nombre es requerido"); return }
    setSaving(true)

    const url = editando ? `/api/competencias/${editando.id}` : "/api/competencias"
    const method = editando ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined }),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al guardar")
    } else {
      setNombre("")
      setDescripcion("")
      setEditando(null)
      fetchCompetencias()
    }
  }

  function iniciarEdicion(comp: Competencia) {
    setEditando(comp)
    setNombre(comp.nombre)
    setDescripcion(comp.descripcion || "")
    setError("")
  }

  function cancelarEdicion() {
    setEditando(null)
    setNombre("")
    setDescripcion("")
    setError("")
  }

  async function handleEliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar la competencia "${nombre}"?`)) return
    const res = await fetch(`/api/competencias/${id}`, { method: "DELETE" })
    if (!res.ok) alert("No se puede eliminar: está en uso por algún proceso.")
    else fetchCompetencias()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Competencias</h1>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editando ? `Editar: ${editando.nombre}` : "Nueva Competencia"}
        </h2>
        <form onSubmit={handleGuardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
              placeholder="Ej: Liderazgo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 resize-none"
              placeholder="Descripción opcional de la competencia..." />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">{error}</div>}
          <div className="flex gap-3">
            {editando && (
              <button type="button" onClick={cancelarEdicion}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
              style={{ background: "#1e3a5f" }}>
              {saving ? "Guardando..." : editando ? "Actualizar" : "Agregar Competencia"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Catálogo</h2>
          <span className="text-sm text-gray-400">{competencias.length} competencias</span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Cargando...</div>
        ) : competencias.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No hay competencias. Crea la primera.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {competencias.map((comp) => (
              <div key={comp.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800">{comp.nombre}</p>
                  {comp.descripcion && <p className="text-sm text-gray-500 mt-0.5">{comp.descripcion}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => iniciarEdicion(comp)}
                    className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">
                    Editar
                  </button>
                  <button onClick={() => handleEliminar(comp.id, comp.nombre)}
                    className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
