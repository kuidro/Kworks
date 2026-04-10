"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Postulacion {
  id: string
  nombre: string
  apellido1: string
  apellido2: string | null
  rut: string
  email: string
  universidad: string
  carrera: string
  rankingNotas: string | null
  respuesta1: string
  respuesta2: string
  cvNombre: string | null
  cvRuta: string | null
  estado: "PENDIENTE" | "SELECCIONADO" | "DESCARTADO"
  creadoEn: string
  candidatoEnProceso: { id: string; estado: string } | null
}

const estadoConfig = {
  PENDIENTE: { label: "Pendiente", clase: "bg-orange-100 text-orange-700" },
  SELECCIONADO: { label: "Seleccionado", clase: "bg-green-100 text-green-700" },
  DESCARTADO: { label: "Descartado", clase: "bg-red-100 text-red-600" },
}

export default function PostulacionesPage() {
  const params = useParams()
  const router = useRouter()
  const procesoId = params.id as string

  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<"TODOS" | "PENDIENTE" | "SELECCIONADO" | "DESCARTADO">("TODOS")
  const [detalle, setDetalle] = useState<Postulacion | null>(null)
  const [procesando, setProcesando] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/procesos/${procesoId}/postulaciones`)
    const data = await res.json()
    setPostulaciones(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [procesoId])

  useEffect(() => { cargar() }, [cargar])

  async function cambiarEstado(id: string, estado: "SELECCIONADO" | "DESCARTADO" | "PENDIENTE") {
    setProcesando(id)
    const res = await fetch(`/api/postulaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
    setProcesando(null)
    if (res.ok) {
      cargar()
      if (detalle?.id === id) setDetalle((d) => d ? { ...d, estado } : null)
    }
  }

  const filtradas = filtro === "TODOS" ? postulaciones : postulaciones.filter((p) => p.estado === filtro)
  const conteos = {
    TODOS: postulaciones.length,
    PENDIENTE: postulaciones.filter((p) => p.estado === "PENDIENTE").length,
    SELECCIONADO: postulaciones.filter((p) => p.estado === "SELECCIONADO").length,
    DESCARTADO: postulaciones.filter((p) => p.estado === "DESCARTADO").length,
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">← Proceso</button>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">Revisión de Postulaciones</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["TODOS", "PENDIENTE", "SELECCIONADO", "DESCARTADO"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filtro === f ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={filtro === f ? { background: "#1e3a5f" } : {}}
          >
            {f === "TODOS" ? "Todas" : estadoConfig[f].label} ({conteos[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando postulaciones...</p>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay postulaciones {filtro !== "TODOS" ? `con estado "${estadoConfig[filtro].label}"` : "aún"}.</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Lista */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Postulante</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Carrera</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ranking</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map((p) => {
                  const conf = estadoConfig[p.estado]
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${detalle?.id === p.id ? "bg-blue-50" : ""}`}
                      onClick={() => setDetalle(p)}
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{p.nombre} {p.apellido1}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs hidden md:table-cell">{p.carrera}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs hidden lg:table-cell">{p.rankingNotas || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${conf.clase}`}>
                          {conf.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {p.estado === "PENDIENTE" && (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => cambiarEstado(p.id, "SELECCIONADO")}
                              disabled={procesando === p.id}
                              className="text-xs px-2.5 py-1 rounded-md font-medium text-white disabled:opacity-50"
                              style={{ background: "#16a34a" }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => cambiarEstado(p.id, "DESCARTADO")}
                              disabled={procesando === p.id}
                              className="text-xs px-2.5 py-1 rounded-md font-medium text-white disabled:opacity-50"
                              style={{ background: "#dc2626" }}
                            >
                              ✗
                            </button>
                          </div>
                        )}
                        {p.estado === "SELECCIONADO" && p.candidatoEnProceso && (
                          <Link
                            href={`/candidatos-proceso/${p.candidatoEnProceso.id}`}
                            className="text-xs text-[#1e3a5f] hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Gestionar →
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Panel detalle */}
          {detalle && (
            <div className="w-96 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit sticky top-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{detalle.nombre} {detalle.apellido1} {detalle.apellido2 || ""}</h3>
                  <p className="text-xs text-gray-500">{detalle.rut} · {detalle.email}</p>
                </div>
                <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Formación</p>
                  <p className="text-gray-700 mt-1">{detalle.carrera}</p>
                  <p className="text-gray-500 text-xs">{detalle.universidad}</p>
                  {detalle.rankingNotas && <p className="text-xs text-gray-400 mt-0.5">Ranking: {detalle.rankingNotas}</p>}
                </div>

                {detalle.cvNombre && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CV</p>
                    <p className="text-xs text-blue-600 mt-1">{detalle.cvNombre}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pregunta 1</p>
                  <p className="text-gray-600 text-xs leading-relaxed">{detalle.respuesta1}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pregunta 2</p>
                  <p className="text-gray-600 text-xs leading-relaxed">{detalle.respuesta2}</p>
                </div>
              </div>

              {detalle.estado === "PENDIENTE" && (
                <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => cambiarEstado(detalle.id, "SELECCIONADO")}
                    disabled={procesando === detalle.id}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "#16a34a" }}
                  >
                    Seleccionar
                  </button>
                  <button
                    onClick={() => cambiarEstado(detalle.id, "DESCARTADO")}
                    disabled={procesando === detalle.id}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "#dc2626" }}
                  >
                    Descartar
                  </button>
                </div>
              )}
              {detalle.estado === "SELECCIONADO" && detalle.candidatoEnProceso && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Link
                    href={`/candidatos-proceso/${detalle.candidatoEnProceso.id}`}
                    className="block w-full text-center py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: "#1e3a5f" }}
                  >
                    Gestionar Evaluación →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
