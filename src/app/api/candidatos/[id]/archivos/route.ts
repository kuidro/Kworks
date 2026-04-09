import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

const TIPOS_PERMITIDOS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
]

const MAX_TAMANO = 10 * 1024 * 1024 // 10MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id: candidatoId } = await params

  // Verificar que el candidato existe
  const candidato = await prisma.candidato.findUnique({ where: { id: candidatoId } })
  if (!candidato) {
    return NextResponse.json({ error: "Candidato no encontrado" }, { status: 404 })
  }

  try {
    const formData = await req.formData()
    const archivo = formData.get("archivo") as File | null

    if (!archivo) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    // Validar tipo
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo PDF, DOC, DOCX e imágenes." },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (archivo.size > MAX_TAMANO) {
      return NextResponse.json(
        { error: "El archivo supera el tamaño máximo de 10MB" },
        { status: 400 }
      )
    }

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), "uploads", candidatoId)
    await mkdir(uploadDir, { recursive: true })

    // Generar nombre único
    const timestamp = Date.now()
    const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const nombreArchivo = `${timestamp}_${nombreLimpio}`
    const rutaCompleta = join(uploadDir, nombreArchivo)
    const rutaRelativa = `uploads/${candidatoId}/${nombreArchivo}`

    // Guardar archivo
    const bytes = await archivo.arrayBuffer()
    await writeFile(rutaCompleta, Buffer.from(bytes))

    // Guardar en BD
    const archivoGuardado = await prisma.archivo.create({
      data: {
        candidatoId,
        nombre: archivo.name,
        ruta: rutaRelativa,
        tipo: archivo.type,
        tamano: archivo.size,
      },
    })

    return NextResponse.json(archivoGuardado, { status: 201 })
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 })
  }
}
