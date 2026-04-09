import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"

export const metadata: Metadata = {
  title: "Montblanc Consulting | Sistema de Evaluación",
  description: "Sistema de evaluación de candidatos para Montblanc Consulting",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-gray-50 antialiased font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
