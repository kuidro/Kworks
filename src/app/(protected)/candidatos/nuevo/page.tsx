"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NuevoCandidatoPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [archivos, setArchivos] = useState<File[]>([])
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    cargo: "",
    linkedin: "",
    notas: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setArchivos(Array.from(e.target.files))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Create candidate
      const res = await fetch("/api/candidatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.message || "Error al crear el candidato")
        setLoading(false)
        return
      }

      const candidato = await res.json()

      // Upload files
      for (const file of archivos) {
        const fd = new FormData()
        fd.append("archivo", file)
        await fetch(`/api/candidatos/${candidato.id}/archivos`, { method: "POST", body: fd })
      }

      router.push(`/candidatos/${candidato.id}`)
    } catch {
      setError("Error inesperado. Intente nuevamente.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/candidatos" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Candidatos
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Candidato</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Datos personales */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Datos Personales
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input name="nombre" required value={form.nombre} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                placeholder="Ej: María González" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                placeholder="correo@ejemplo.cl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo postulado</label>
              <input name="cargo" value={form.cargo} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                placeholder="Ej: Gerente de Operaciones" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input name="linkedin" value={form.linkedin} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                placeholder="linkedin.com/in/usuario" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
              <textarea name="notas" value={form.notas} onChange={handleChange} rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 resize-none"
                placeholder="Observaciones relevantes..." />
            </div>
          </div>
        </div>

        {/* Archivos */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Archivos Adjuntos
          </h2>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500">
              {archivos.length > 0
                ? `${archivos.length} archivo${archivos.length !== 1 ? "s" : ""} seleccionado${archivos.length !== 1 ? "s" : ""}`
                : "Haga clic para adjuntar archivos"}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, imágenes · máx. 10MB por archivo</p>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" onChange={handleFiles} className="hidden" />
          </div>
          {archivos.length > 0 && (
            <ul className="mt-3 space-y-1">
              {archivos.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {f.name} <span className="text-gray-400">({(f.size / 1024).toFixed(0)} KB)</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/candidatos" className="flex-1 text-center py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-opacity"
            style={{ background: "#1e3a5f" }}
          >
            {loading ? "Guardando..." : "Crear Candidato"}
          </button>
        </div>
      </form>
    </div>
  )
}
