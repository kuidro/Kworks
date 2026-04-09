import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"

export default async function ProcesosPage() {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") redirect("/dashboard")

  const procesos = await prisma.procesoEvaluacion.findMany({
    include: {
      candidato: true,
      etapas: {
        include: { evaluador: true },
        orderBy: { orden: "asc" },
      },
    },
    orderBy: { creadoEn: "desc" },
  })

  const estadoConfig = {
    EN_PROGRESO: { label: "En Progreso", clase: "bg-yellow-100 text-yellow-700" },
    COMPLETADO: { label: "Completado", clase: "bg-green-100 text-green-700" },
    TERMINADO: { label: "Terminado", clase: "bg-red-100 text-red-700" },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procesos de Evaluación</h1>
          <p className="text-gray-500 text-sm mt-1">{procesos.length} proceso{procesos.length !== 1 ? "s" : ""} en total</p>
        </div>
        <Link
          href="/procesos/nuevo"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}
        >
          + Nuevo Proceso
        </Link>
      </div>

      {procesos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No hay procesos creados aún.</p>
          <Link href="/procesos/nuevo" className="mt-4 inline-block text-sm font-medium text-[#1e3a5f] hover:underline">
            Crear el primer proceso →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidato</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proceso</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Etapas</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {procesos.map((proceso) => {
                const config = estadoConfig[proceso.estado]
                const etapaActiva = proceso.etapas.find((e) => e.estado === "ACTIVA")
                return (
                  <tr key={proceso.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{proceso.candidato.nombre}</p>
                      <p className="text-xs text-gray-400">{proceso.candidato.cargo || "Sin cargo"}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{proceso.titulo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {proceso.etapas.map((etapa) => (
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
                      </div>
                      {etapaActiva && (
                        <p className="text-xs text-gray-400 mt-1">En etapa {etapaActiva.orden} — {etapaActiva.evaluador.nombre}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.clase}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(proceso.creadoEn)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/procesos/${proceso.id}`} className="text-[#1e3a5f] hover:underline text-xs font-medium">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
