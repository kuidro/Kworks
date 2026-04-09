"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface Candidato {
  id: string
  nombre: string
  email: string
  telefono: string | null
  cargo: string | null
  creadoEn: string
  _count: { procesos: number }
}

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchCandidatos = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/candidatos${busqueda ? `?q=${encodeURIComponent(busqueda)}` : ""}`)
    if (res.ok) setCandidatos(await res.json())
    setLoading(false)
  }, [busqueda])

  useEffect(() => {
    const timer = setTimeout(fetchCandidatos, 300)
    return () => clearTimeout(timer)
  }, [fetchCandidatos])

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar al candidato "${nombre}"? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/candidatos/${id}`, { method: "DELETE" })
    fetchCandidatos()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
        <Link
          href="/candidatos/nuevo"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "#c9a84c" }}
        >
          + Nuevo Candidato
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o cargo..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">Cargando...</div>
      ) : candidatos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400 mb-4">{busqueda ? "No se encontraron candidatos." : "No hay candidatos registrados."}</p>
          {!busqueda && (
            <Link href="/candidatos/nuevo" className="text-sm font-medium" style={{ color: "#1e3a5f" }}>
              Crear el primer candidato →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200" style={{ background: "#f8f9fa" }}>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Cargo</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Procesos</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Registrado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidatos.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.nombre}</td>
                    <td className="px-6 py-4 text-gray-500">{c.email}</td>
                    <td className="px-6 py-4 text-gray-500">{c.cargo || "—"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {c._count.procesos}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{formatDate(c.creadoEn)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/candidatos/${c.id}`} className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: "#1e3a5f" }}>
                          Ver
                        </Link>
                        <Link href={`/procesos/nuevo?candidatoId=${c.id}`} className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: "#c9a84c" }}>
                          + Proceso
                        </Link>
                        <button
                          onClick={() => eliminar(c.id, c.nombre)}
                          className="text-xs px-3 py-1.5 rounded-md font-medium text-red-600 hover:bg-red-50 border border-red-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {candidatos.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{c.nombre}</p>
                    <p className="text-sm text-gray-500">{c.email}</p>
                    {c.cargo && <p className="text-sm text-gray-400">{c.cargo}</p>}
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{c._count.procesos} proc.</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/candidatos/${c.id}`} className="flex-1 text-center text-xs py-2 rounded-md font-medium text-white" style={{ background: "#1e3a5f" }}>Ver</Link>
                  <Link href={`/procesos/nuevo?candidatoId=${c.id}`} className="flex-1 text-center text-xs py-2 rounded-md font-medium text-white" style={{ background: "#c9a84c" }}>+ Proceso</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
