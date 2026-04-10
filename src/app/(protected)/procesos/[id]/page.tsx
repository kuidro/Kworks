import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

const estadoProcesoConfig: Record<string, { label: string; clase: string }> = {
  BORRADOR: { label: "Borrador", clase: "bg-gray-100 text-gray-600" },
  ABIERTO: { label: "Abierto", clase: "bg-blue-100 text-blue-700" },
  EN_PROGRESO: { label: "En Progreso", clase: "bg-yellow-100 text-yellow-700" },
  CERRADO: { label: "Cerrado", clase: "bg-green-100 text-green-700" },
}

const estadoCandidatoConfig: Record<string, { label: string; clase: string }> = {
  EN_PRUEBA: { label: "En Prueba", clase: "bg-blue-100 text-blue-700" },
  EN_ENTREVISTAS: { label: "En Entrevistas", clase: "bg-yellow-100 text-yellow-700" },
  COMPLETADO: { label: "Completado", clase: "bg-green-100 text-green-700" },
  DESCARTADO: { label: "Descartado", clase: "bg-red-100 text-red-600" },
}

export default async function ProcesoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") redirect("/dashboard")

  const { id } = await params

  const proceso = await prisma.proceso.findUnique({
    where: { id },
    include: {
      tipoProceso: { select: { nombre: true } },
      _count: { select: { postulaciones: true, candidatos: true } },
      candidatos: {
        orderBy: { creadoEn: "asc" },
        include: {
          postulacion: {
            select: { nombre: true, apellido1: true, apellido2: true, rut: true, email: true, universidad: true, carrera: true },
          },
          prueba: { select: { fechaHora: true, puntaje: true, completada: true } },
          etapas: {
            orderBy: { orden: "asc" },
            include: {
              evaluador: { select: { nombre: true } },
            },
          },
        },
      },
    },
  })

  if (!proceso) notFound()

  const postulacionesPendientes = await prisma.postulacion.count({
    where: { procesoId: id, estado: "PENDIENTE" },
  })

  const conf = estadoProcesoConfig[proceso.estado]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/procesos" className="text-gray-400 hover:text-gray-600">← Procesos</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900 truncate">{proceso.nombre}</h1>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{proceso.nombre}</h2>
            <p className="text-sm text-gray-500 mt-1">Tipo: {proceso.tipoProceso.nombre}</p>
            {proceso.descripcion && (
              <p className="text-sm text-gray-400 mt-1">{proceso.descripcion}</p>
            )}
          </div>
          <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${conf.clase}`}>
            {conf.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
          <span>Creado: {formatDate(proceso.creadoEn)}</span>
          {proceso.fechaInicio && <span>Inicio: {formatDate(proceso.fechaInicio)}</span>}
          {proceso.fechaFin && <span>Cierre: {formatDate(proceso.fechaFin)}</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link href={`/procesos/${id}/postulaciones`} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>{proceso._count.postulaciones}</p>
          <p className="text-sm text-gray-500 mt-1">Postulaciones totales</p>
          {postulacionesPendientes > 0 && (
            <p className="text-xs text-orange-600 mt-1 font-medium">{postulacionesPendientes} pendiente{postulacionesPendientes !== 1 ? "s" : ""} de revisar</p>
          )}
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-blue-600">{proceso._count.candidatos}</p>
          <p className="text-sm text-gray-500 mt-1">Candidatos seleccionados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-green-600">
            {proceso.candidatos.filter((c) => c.estado === "COMPLETADO").length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Completaron el proceso</p>
        </div>
      </div>

      {/* Postulaciones CTA */}
      <div className="flex gap-3 mb-6">
        <Link
          href={`/procesos/${id}/postulaciones`}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}
        >
          Revisar Postulaciones
        </Link>
        {proceso.estado === "BORRADOR" && (
          <span className="text-xs text-gray-400 self-center">
            Cambia el estado a &quot;Abierto&quot; para recibir postulaciones
          </span>
        )}
      </div>

      {/* Candidatos en proceso */}
      {proceso.candidatos.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Candidatos en Evaluación</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidato</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Carrera</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prueba</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Etapas</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {proceso.candidatos.map((candidato) => {
                  const post = candidato.postulacion
                  const estadoConf = estadoCandidatoConfig[candidato.estado]
                  const etapaActiva = candidato.etapas.find((e) => e.estado === "ACTIVA")
                  return (
                    <tr key={candidato.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{post.nombre} {post.apellido1}</p>
                        <p className="text-xs text-gray-400">{post.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{post.carrera}</td>
                      <td className="px-6 py-4">
                        {candidato.prueba ? (
                          <div>
                            {candidato.prueba.completada ? (
                              <span className="text-green-600 font-medium">{candidato.prueba.puntaje ?? "—"} pts</span>
                            ) : candidato.prueba.fechaHora ? (
                              <span className="text-blue-600 text-xs">{formatDate(candidato.prueba.fechaHora)}</span>
                            ) : (
                              <span className="text-gray-400 text-xs">Pendiente</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {candidato.etapas.map((etapa) => (
                            <span
                              key={etapa.id}
                              title={`Etapa ${etapa.orden}: ${etapa.evaluador.nombre}`}
                              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                                etapa.estado === "COMPLETADA" ? "bg-green-100 text-green-700" :
                                etapa.estado === "ACTIVA" ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {etapa.orden}
                            </span>
                          ))}
                          {candidato.etapas.length === 0 && (
                            <span className="text-xs text-gray-400">Sin etapas</span>
                          )}
                        </div>
                        {etapaActiva && (
                          <p className="text-xs text-gray-400 mt-1">{etapaActiva.evaluador.nombre}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${estadoConf.clase}`}>
                          {estadoConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/candidatos-proceso/${candidato.id}`} className="text-[#1e3a5f] hover:underline text-xs font-medium">
                          Gestionar →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">Aún no hay candidatos seleccionados para evaluación.</p>
          <Link href={`/procesos/${id}/postulaciones`} className="mt-3 inline-block text-sm font-medium text-[#1e3a5f] hover:underline">
            Revisar postulaciones →
          </Link>
        </div>
      )}
    </div>
  )
}
