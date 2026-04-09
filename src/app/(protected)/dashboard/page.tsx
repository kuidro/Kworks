import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  const esAdmin = session?.user?.rol === "ADMIN"

  if (esAdmin) {
    const [totalCandidatos, enProgreso, completados, terminados, etapasPendientes] = await Promise.all([
      prisma.candidato.count(),
      prisma.procesoEvaluacion.count({ where: { estado: "EN_PROGRESO" } }),
      prisma.procesoEvaluacion.count({ where: { estado: "COMPLETADO" } }),
      prisma.procesoEvaluacion.count({ where: { estado: "TERMINADO" } }),
      prisma.etapaEvaluacion.findMany({
        where: { estado: "ACTIVA" },
        include: {
          evaluador: { select: { nombre: true } },
          proceso: { include: { candidato: { select: { nombre: true, cargo: true } } } },
        },
        orderBy: { proceso: { actualizadoEn: "desc" } },
        take: 10,
      }),
    ])

    const candidatosRecientes = await prisma.candidato.findMany({
      orderBy: { creadoEn: "desc" },
      take: 5,
      include: { _count: { select: { procesos: true } } },
    })

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Candidatos", value: totalCandidatos, color: "#1e3a5f", href: "/candidatos" },
            { label: "En Progreso", value: enProgreso, color: "#2563eb", href: "/procesos?estado=EN_PROGRESO" },
            { label: "Completados", value: completados, color: "#16a34a", href: "/procesos?estado=COMPLETADO" },
            { label: "Terminados", value: terminados, color: "#dc2626", href: "/procesos?estado=TERMINADO" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-1 hover:shadow-md transition-shadow border border-gray-100">
              <span className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Evaluaciones activas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Evaluaciones Activas</h2>
            {etapasPendientes.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay evaluaciones activas.</p>
            ) : (
              <div className="space-y-3">
                {etapasPendientes.map((etapa) => (
                  <div key={etapa.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{etapa.proceso.candidato.nombre}</p>
                      <p className="text-xs text-gray-500">{etapa.proceso.candidato.cargo || "Sin cargo"} · Etapa {etapa.orden}</p>
                      <p className="text-xs text-blue-600 mt-0.5">Evaluador: {etapa.evaluador.nombre}</p>
                    </div>
                    <Link href={`/evaluaciones/${etapa.id}`} className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ background: "#1e3a5f" }}>
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Candidatos recientes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Candidatos Recientes</h2>
              <Link href="/candidatos" className="text-xs font-medium" style={{ color: "#1e3a5f" }}>Ver todos →</Link>
            </div>
            {candidatosRecientes.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay candidatos aún.</p>
            ) : (
              <div className="space-y-3">
                {candidatosRecientes.map((c) => (
                  <Link key={c.id} href={`/candidatos/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{c.nombre}</p>
                      <p className="text-xs text-gray-500">{c.cargo || "Sin cargo"} · {formatDate(c.creadoEn)}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{c._count.procesos} proceso{c._count.procesos !== 1 ? "s" : ""}</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <Link href="/candidatos/nuevo" className="flex-1 text-center text-sm py-2 rounded-lg font-medium text-white" style={{ background: "#c9a84c" }}>
                + Nuevo Candidato
              </Link>
              <Link href="/procesos/nuevo" className="flex-1 text-center text-sm py-2 rounded-lg font-medium text-white" style={{ background: "#1e3a5f" }}>
                + Nuevo Proceso
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista del evaluador
  const misEtapas = await prisma.etapaEvaluacion.findMany({
    where: { evaluadorId: session!.user.id, estado: { in: ["ACTIVA", "COMPLETADA"] } },
    include: {
      proceso: {
        include: { candidato: { select: { nombre: true, cargo: true } } },
      },
      competencias: { include: { competencia: true } },
    },
    orderBy: { proceso: { actualizadoEn: "desc" } },
  })

  const activas = misEtapas.filter((e) => e.estado === "ACTIVA")
  const completadas = misEtapas.filter((e) => e.estado === "COMPLETADA")

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Hola, {session?.user?.nombre}</h1>
      <p className="text-gray-500 mb-6">Aquí encontrarás tus evaluaciones asignadas.</p>

      {activas.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Evaluaciones Pendientes</h2>
          <div className="space-y-3">
            {activas.map((etapa) => (
              <div key={etapa.id} className="bg-white border border-yellow-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{etapa.proceso.candidato.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{etapa.proceso.candidato.cargo || "Sin cargo especificado"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Etapa {etapa.orden} · {etapa.competencias.length} competencia{etapa.competencias.length !== 1 ? "s" : ""} a evaluar
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800">Pendiente</span>
                </div>
                <Link
                  href={`/evaluaciones/${etapa.id}`}
                  className="mt-4 inline-block w-full text-center py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "#1e3a5f" }}
                >
                  Ir a Evaluar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {completadas.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Evaluaciones Completadas</h2>
          <div className="space-y-3">
            {completadas.map((etapa) => (
              <div key={etapa.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{etapa.proceso.candidato.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{etapa.proceso.candidato.cargo || "Sin cargo"}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${etapa.decision === "AVANZA" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {etapa.decision === "AVANZA" ? "Avanzó" : "Terminado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {misEtapas.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400">No tienes evaluaciones asignadas por el momento.</p>
        </div>
      )}
    </div>
  )
}
