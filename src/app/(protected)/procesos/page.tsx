import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"

export default async function ProcesosPage() {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") redirect("/dashboard")

  const procesos = await prisma.proceso.findMany({
    include: {
      tipoProceso: { select: { nombre: true } },
      _count: { select: { postulaciones: true, candidatos: true } },
    },
    orderBy: { creadoEn: "desc" },
  })

  const estadoConfig: Record<string, { label: string; clase: string }> = {
    BORRADOR: { label: "Borrador", clase: "bg-gray-100 text-gray-600" },
    ABIERTO: { label: "Abierto", clase: "bg-blue-100 text-blue-700" },
    EN_PROGRESO: { label: "En Progreso", clase: "bg-yellow-100 text-yellow-700" },
    CERRADO: { label: "Cerrado", clase: "bg-green-100 text-green-700" },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procesos de Selección</h1>
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proceso</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Postulaciones</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidatos</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {procesos.map((proceso) => {
                const conf = estadoConfig[proceso.estado]
                return (
                  <tr key={proceso.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{proceso.nombre}</p>
                      {proceso.descripcion && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{proceso.descripcion}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{proceso.tipoProceso.nombre}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{proceso._count.postulaciones}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{proceso._count.candidatos}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${conf.clase}`}>
                        {conf.label}
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
