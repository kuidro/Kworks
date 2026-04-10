import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  const esAdmin = session?.user?.rol === "ADMIN"

  if (esAdmin) {
    const [totalPostulaciones, totalCandidatos, procesosAbiertos, etapasPendientes] = await Promise.all([
      prisma.postulacion.count(),
      prisma.candidatoEnProceso.count({ where: { estado: { not: "DESCARTADO" } } }),
      prisma.proceso.count({ where: { estado: "ABIERTO" } }),
      prisma.etapaEvaluacion.findMany({
        where: { estado: "ACTIVA" },
        include: {
          evaluador: { select: { nombre: true } },
          candidatoEnProceso: {
            include: {
              postulacion: { select: { nombre: true, apellido1: true, carrera: true } },
              proceso: { select: { id: true, nombre: true } },
            },
          },
        },
        orderBy: { orden: "asc" },
        take: 10,
      }),
    ])

    const procesosRecientes = await prisma.proceso.findMany({
      orderBy: { creadoEn: "desc" },
      take: 5,
      include: {
        tipoProceso: { select: { nombre: true } },
        _count: { select: { postulaciones: true, candidatos: true } },
      },
    })

    const estadoConfig: Record<string, { label: string; clase: string }> = {
      BORRADOR: { label: "Borrador", clase: "bg-gray-100 text-gray-600" },
      ABIERTO: { label: "Abierto", clase: "bg-blue-100 text-blue-700" },
      EN_PROGRESO: { label: "En Progreso", clase: "bg-yellow-100 text-yellow-700" },
      CERRADO: { label: "Cerrado", clase: "bg-green-100 text-green-700" },
    }

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Postulaciones", value: totalPostulaciones, color: "#1e3a5f", href: "/procesos" },
            { label: "Candidatos Activos", value: totalCandidatos, color: "#2563eb", href: "/procesos" },
            { label: "Procesos Abiertos", value: procesosAbiertos, color: "#16a34a", href: "/procesos?estado=ABIERTO" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-1 hover:shadow-md transition-shadow border border-gray-100">
              <span className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Evaluaciones Activas</h2>
            {etapasPendientes.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay evaluaciones activas.</p>
            ) : (
              <div className="space-y-3">
                {etapasPendientes.map((etapa) => {
                  const p = etapa.candidatoEnProceso.postulacion
                  return (
                    <div key={etapa.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{p.nombre} {p.apellido1}</p>
                        <p className="text-xs text-gray-500">{p.carrera} · Etapa {etapa.orden}</p>
                        <p className="text-xs text-blue-600 mt-0.5">Evaluador: {etapa.evaluador.nombre}</p>
                      </div>
                      <Link href={`/evaluaciones/${etapa.id}`} className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ background: "#1e3a5f" }}>
                        Ver
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Procesos Recientes</h2>
              <Link href="/procesos" className="text-xs font-medium" style={{ color: "#1e3a5f" }}>Ver todos →</Link>
            </div>
            {procesosRecientes.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay procesos aún.</p>
            ) : (
              <div className="space-y-3">
                {procesosRecientes.map((p) => {
                  const conf = estadoConfig[p.estado]
                  return (
                    <Link key={p.id} href={`/procesos/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{p.nombre}</p>
                        <p className="text-xs text-gray-500">{p.tipoProceso.nombre} · {formatDate(p.creadoEn)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${conf.clase}`}>{conf.label}</span>
                        <p className="text-xs text-gray-400 mt-1">{p._count.postulaciones} postul.</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/procesos/nuevo" className="block text-center text-sm py-2 rounded-lg font-medium text-white" style={{ background: "#1e3a5f" }}>
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
      candidatoEnProceso: {
        include: {
          postulacion: { select: { nombre: true, apellido1: true, carrera: true } },
          proceso: { select: { id: true, nombre: true } },
        },
      },
      competencias: { include: { competencia: true } },
    },
    orderBy: { orden: "asc" },
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
            {activas.map((etapa) => {
              const post = etapa.candidatoEnProceso.postulacion
              return (
                <div key={etapa.id} className="bg-white border border-yellow-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.nombre} {post.apellido1}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{post.carrera}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {etapa.candidatoEnProceso.proceso.nombre} · Etapa {etapa.orden} · {etapa.competencias.length} competencia{etapa.competencias.length !== 1 ? "s" : ""}
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
              )
            })}
          </div>
        </div>
      )}

      {completadas.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Evaluaciones Completadas</h2>
          <div className="space-y-3">
            {completadas.map((etapa) => {
              const post = etapa.candidatoEnProceso.postulacion
              return (
                <div key={etapa.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-75">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{post.nombre} {post.apellido1}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{post.carrera}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${etapa.decision === "AVANZA" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {etapa.decision === "AVANZA" ? "Avanzó" : "Terminado"}
                    </span>
                  </div>
                </div>
              )
            })}
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
