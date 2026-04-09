import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

const estadoConfig = {
  EN_PROGRESO: { label: "En Progreso", class: "bg-blue-100 text-blue-700" },
  COMPLETADO: { label: "Completado", class: "bg-green-100 text-green-700" },
  TERMINADO: { label: "Terminado", class: "bg-red-100 text-red-700" },
}

const etapaConfig = {
  PENDIENTE: { label: "Pendiente", class: "bg-gray-100 text-gray-500" },
  ACTIVA: { label: "Activa", class: "bg-yellow-100 text-yellow-700" },
  COMPLETADA: { label: "Completada", class: "bg-green-100 text-green-700" },
}

export default async function CandidatoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  await auth()
  const { id } = await params

  const candidato = await prisma.candidato.findUnique({
    where: { id },
    include: {
      archivos: { orderBy: { subidoEn: "desc" } },
      procesos: {
        orderBy: { creadoEn: "desc" },
        include: {
          etapas: {
            orderBy: { orden: "asc" },
            include: { evaluador: { select: { nombre: true } } },
          },
        },
      },
    },
  })

  if (!candidato) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/candidatos" className="text-gray-400 hover:text-gray-600 transition-colors">← Candidatos</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{candidato.nombre}</h1>
      </div>

      <div className="grid gap-6">
        {/* Datos del candidato */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Información Personal</h2>
            <Link href={`/procesos/nuevo?candidatoId=${candidato.id}`}
              className="text-sm px-4 py-2 rounded-lg font-medium text-white" style={{ background: "#c9a84c" }}>
              + Nuevo Proceso
            </Link>
          </div>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Email", value: candidato.email },
              { label: "Teléfono", value: candidato.telefono || "—" },
              { label: "Cargo postulado", value: candidato.cargo || "—" },
              { label: "LinkedIn", value: candidato.linkedin || "—" },
              { label: "Registrado", value: formatDate(candidato.creadoEn) },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-gray-400 font-medium">{item.label}</dt>
                <dd className="text-gray-800 mt-0.5">{item.value}</dd>
              </div>
            ))}
            {candidato.notas && (
              <div className="sm:col-span-2">
                <dt className="text-gray-400 font-medium">Notas</dt>
                <dd className="text-gray-800 mt-0.5 whitespace-pre-line">{candidato.notas}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Archivos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Archivos Adjuntos</h2>
            <span className="text-sm text-gray-400">{candidato.archivos.length} archivo{candidato.archivos.length !== 1 ? "s" : ""}</span>
          </div>
          {candidato.archivos.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay archivos adjuntos.</p>
          ) : (
            <div className="space-y-2">
              {candidato.archivos.map((archivo) => (
                <div key={archivo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{archivo.nombre}</p>
                      <p className="text-xs text-gray-400">{(archivo.tamano / 1024).toFixed(0)} KB · {formatDate(archivo.subidoEn)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={`/api/archivos/${archivo.id}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: "#1e3a5f" }}>
                      Descargar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Procesos de evaluación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Procesos de Evaluación</h2>
          {candidato.procesos.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-3">Sin procesos de evaluación.</p>
              <Link href={`/procesos/nuevo?candidatoId=${candidato.id}`}
                className="text-sm font-medium" style={{ color: "#1e3a5f" }}>
                Crear primer proceso →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {candidato.procesos.map((proceso) => (
                <div key={proceso.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{proceso.titulo}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(proceso.creadoEn)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoConfig[proceso.estado].class}`}>
                        {estadoConfig[proceso.estado].label}
                      </span>
                      <Link href={`/procesos/${proceso.id}`}
                        className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: "#1e3a5f" }}>
                        Ver
                      </Link>
                    </div>
                  </div>
                  {/* Etapas timeline */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {proceso.etapas.map((etapa, idx) => (
                      <div key={etapa.id} className="flex items-center gap-1">
                        {idx > 0 && <div className="w-4 h-px bg-gray-300" />}
                        <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${etapaConfig[etapa.estado].class}`}>
                          {etapa.orden}. {etapa.evaluador.nombre.split(" ")[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
