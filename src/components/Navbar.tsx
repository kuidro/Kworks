"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const pathname = usePathname()

  const esAdmin = session?.user?.rol === "ADMIN"

  const linksAdmin = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/candidatos", label: "Candidatos" },
    { href: "/procesos", label: "Procesos" },
    { href: "/admin/competencias", label: "Competencias" },
    { href: "/admin/usuarios", label: "Usuarios" },
  ]

  const linksEvaluador = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard", label: "Mis Evaluaciones" },
  ]

  const links = esAdmin ? linksAdmin : linksEvaluador

  return (
    <nav className="bg-[#1e3a5f] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#c9a84c] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <Link href="/dashboard" className="text-white font-bold text-lg tracking-wide hidden sm:block">
              Montblanc Consulting
            </Link>
            <Link href="/dashboard" className="text-white font-bold text-base sm:hidden">
              Montblanc
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-[#c9a84c] text-white"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-3">
            {session?.user && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-[#c9a84c] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase">
                    {session.user.nombre?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white text-sm font-medium leading-none">{session.user.nombre}</p>
                  <p className="text-gray-300 text-xs mt-0.5">
                    {session.user.rol === "ADMIN" ? "Administrador" : "Evaluador"}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>

            {/* Hamburger */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menú"
            >
              {menuAbierto ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuAbierto && (
        <div className="lg:hidden bg-[#152d4a] border-t border-white/10">
          <div className="px-4 py-3 space-y-1">
            {session?.user && (
              <div className="flex items-center gap-2 pb-3 mb-2 border-b border-white/10">
                <div className="w-8 h-8 bg-[#c9a84c] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase">
                    {session.user.nombre?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{session.user.nombre}</p>
                  <p className="text-gray-300 text-xs">
                    {session.user.rol === "ADMIN" ? "Administrador" : "Evaluador"}
                  </p>
                </div>
              </div>
            )}
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-[#c9a84c] text-white"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-colors mt-2 border-t border-white/10 pt-3"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
