"use client"

import { useState, useEffect } from "react"

interface TipoProceso {
  id: string
  nombre: string
  descripcion: string | null
  activo: boolean
  creadoEn: string
}

export default function TiposProcesoPage() {
  const [tipos, setTipos] = useState<TipoProceso[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<TipoProceso | null>(null)
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function cargar() {
    const res = await fetch("/api/tipos-proceso")
    const data = await res.json()
    setTipos(data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  function abrirNuevo() {
    setEditando(null)
    setNombre("")
    setDescripcion("")
    setError("")
    setShowForm(true)
  }

  function abrirEditar(tipo: TipoProceso) {
    setEditando(tipo)
    setNombre(tipo.nombre)
    setDescripcion(tipo.descripcion || "")
    setError("")
    setShowForm(true)
  }

  async function guardar() {
    setError("")
    if (!nombre.trim()) { setError("El nombre es requerido"); return }
    setSaving(true)

    const res = await fetch(editando ? `/api/tipos-proceso/${editando.id}` : "/api/tipos-proceso", {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined }),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al guardar")
    } else {
      setShowForm(false)
      cargar()
    }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Desactivar este tipo de proceso?")) return
    await fetch(`/api/tipos-proceso/${id}`, { method: "DELETE" })
    cargar()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Proceso</h1>
          <p className="text-sm text-gray-500 mt-1">Categorías de procesos de selección</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}
        >
          + Nuevo Tipo
        </button>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editando ? "Editar Tipo" : "Nuevo Tipo de Proceso"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Analista Junior, Gerente, MBA..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 resize-none"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardar}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#1e3a5f" }}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : tipos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay tipos de proceso creados.</p>
          <button onClick={abrirNuevo} className="mt-3 text-sm font-medium text-[#1e3a5f] hover:underline">
            Crear el primero →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {tipos.map((tipo) => (
            <div key={tipo.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-gray-900">{tipo.nombre}</p>
                {tipo.descripcion && (
                  <p className="text-xs text-gray-400 mt-0.5">{tipo.descripcion}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => abrirEditar(tipo)}
                  className="text-xs text-[#1e3a5f] hover:underline font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(tipo.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Desactivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
