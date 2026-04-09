"use client"

import { useState, useEffect } from "react"
import { formatDate } from "@/lib/utils"

interface Usuario { id: string; nombre: string; email: string; rol: string; creadoEn: string }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "EVALUADOR" })

  const fetchUsuarios = async () => {
    const res = await fetch("/api/usuarios")
    if (res.ok) setUsuarios(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchUsuarios() }, [])

  function abrirNuevo() {
    setEditando(null)
    setForm({ nombre: "", email: "", password: "", rol: "EVALUADOR" })
    setError("")
    setModalAbierto(true)
  }

  function abrirEdicion(u: Usuario) {
    setEditando(u)
    setForm({ nombre: u.nombre, email: u.email, password: "", rol: u.rol })
    setError("")
    setModalAbierto(true)
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const body: Record<string, string> = { nombre: form.nombre, email: form.email, rol: form.rol }
    if (form.password) body.password = form.password
    if (!editando) body.password = form.password // required for new

    const url = editando ? `/api/usuarios/${editando.id}` : "/api/usuarios"
    const method = editando ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al guardar")
    } else {
      setModalAbierto(false)
      fetchUsuarios()
    }
  }

  async function handleEliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar al usuario "${nombre}"?`)) return
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || "No se puede eliminar el usuario.")
    } else fetchUsuarios()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <button onClick={abrirNuevo} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#1e3a5f" }}>
          + Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No hay usuarios.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Rol</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Registrado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.nombre}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.rol === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {u.rol === "ADMIN" ? "Administrador" : "Evaluador"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{formatDate(u.creadoEn)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => abrirEdicion(u)} className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">Editar</button>
                        <button onClick={() => handleEliminar(u.id, u.nombre)} className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-5">{editando ? "Editar Usuario" : "Nuevo Usuario"}</h3>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editando ? "(dejar en blanco para no cambiar)" : "*"}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editando} minLength={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-gray-900 bg-white">
                  <option value="EVALUADOR">Evaluador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                  style={{ background: "#1e3a5f" }}>
                  {saving ? "Guardando..." : editando ? "Actualizar" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
