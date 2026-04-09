import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { readFile, unlink } from "fs/promises"
import { join } from "path"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const archivo = await prisma.archivo.findUnique({ where: { id } })
  if (!archivo) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
  }

  try {
    const rutaCompleta = join(process.cwd(), archivo.ruta)
    const buffer = await readFile(rutaCompleta)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": archivo.tipo,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(archivo.nombre)}"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error al leer archivo:", error)
    return NextResponse.json({ error: "No se pudo leer el archivo" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const archivo = await prisma.archivo.findUnique({ where: { id } })
  if (!archivo) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
  }

  try {
    // Eliminar archivo del sistema de archivos
    const rutaCompleta = join(process.cwd(), archivo.ruta)
    await unlink(rutaCompleta).catch(() => {
      // Ignorar error si el archivo ya no existe
    })

    // Eliminar de BD
    await prisma.archivo.delete({ where: { id } })

    return NextResponse.json({ mensaje: "Archivo eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar archivo:", error)
    return NextResponse.json({ error: "Error al eliminar archivo" }, { status: 500 })
  }
}
