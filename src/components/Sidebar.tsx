"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

const iconos = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  candidatos: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  procesos: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  competencias: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  usuarios: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
}

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const esAdmin = session?.user?.rol === "ADMIN"

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icono: iconos.dashboard, adminOnly: false },
    { href: "/candidatos", label: "Candidatos", icono: iconos.candidatos, adminOnly: true },
    { href: "/procesos", label: "Procesos", icono: iconos.procesos, adminOnly: true },
    { href: "/admin/competencias", label: "Competencias", icono: iconos.competencias, adminOnly: true },
    { href: "/admin/usuarios", label: "Usuarios", icono: iconos.usuarios, adminOnly: true },
  ]

  const itemsVisibles = navItems.filter((item) => !item.adminOnly || esAdmin)

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-full">
      <div className="flex-1 px-4 py-6 space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
          Navegación
        </p>
        {itemsVisibles.map((item) => {
          const activo = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activo
                  ? "bg-[#1e3a5f] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#1e3a5f]"
              }`}
            >
              <span className={activo ? "text-white" : "text-gray-400"}>
                {item.icono}
              </span>
              {item.label}
              {activo && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c9a84c]"></span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer del sidebar */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 px-3">
          <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
            <span className="text-[#c9a84c] text-xs font-bold uppercase">
              {session?.user?.nombre?.charAt(0) || "U"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{session?.user?.nombre}</p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.rol === "ADMIN" ? "Administrador" : "Evaluador"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
