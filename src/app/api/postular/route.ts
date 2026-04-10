import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const procesoId = formData.get("procesoId") as string
    const nombre = formData.get("nombre") as string
    const apellido1 = formData.get("apellido1") as string
    const apellido2 = formData.get("apellido2") as string | null
    const rut = formData.get("rut") as string
    const email = formData.get("email") as string
    const universidad = formData.get("universidad") as string
    const carrera = formData.get("carrera") as string
    const rankingNotas = formData.get("rankingNotas") as string | null
    const respuesta1 = formData.get("respuesta1") as string
    const respuesta2 = formData.get("respuesta2") as string
    const cvFile = formData.get("cv") as File | null

    // Validaciones básicas
    if (!procesoId || !nombre || !apellido1 || !rut || !email || !universidad || !carrera || !respuesta1 || !respuesta2) {
      return NextResponse.json({ error: "Todos los campos obligatorios son requeridos" }, { status: 400 })
    }

    // Verificar que el proceso existe y está ABIERTO
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId, estado: "ABIERTO" },
    })

    if (!proceso) {
      return NextResponse.json({ error: "El proceso no existe o no está disponible" }, { status: 404 })
    }

    // Crear la postulación primero (sin CV)
    const postulacion = await prisma.postulacion.create({
      data: {
        procesoId,
        tipoProcesoId: proceso.tipoProcesoId,
        nombre: nombre.trim(),
        apellido1: apellido1.trim(),
        apellido2: apellido2?.trim() || null,
        rut: rut.trim(),
        email: email.trim().toLowerCase(),
        universidad: universidad.trim(),
        carrera: carrera.trim(),
        rankingNotas: rankingNotas?.trim() || null,
        respuesta1: respuesta1.trim(),
        respuesta2: respuesta2.trim(),
      },
    })

    // Guardar CV si se proporcionó
    let cvNombre: string | null = null
    let cvRuta: string | null = null

    if (cvFile && cvFile.size > 0) {
      if (cvFile.size > 10 * 1024 * 1024) {
        // Eliminar la postulación si el CV es muy grande
        await prisma.postulacion.delete({ where: { id: postulacion.id } })
        return NextResponse.json({ error: "El archivo CV no puede superar los 10MB" }, { status: 400 })
      }

      const uploadDir = path.join(process.cwd(), "uploads", "cvs", postulacion.id)
      await mkdir(uploadDir, { recursive: true })

      const safeName = cvFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const filePath = path.join(uploadDir, safeName)
      const buffer = Buffer.from(await cvFile.arrayBuffer())
      await writeFile(filePath, buffer)

      cvNombre = safeName
      cvRuta = `uploads/cvs/${postulacion.id}/${safeName}`

      // Actualizar postulación con info del CV
      await prisma.postulacion.update({
        where: { id: postulacion.id },
        data: { cvNombre, cvRuta },
      })
    }

    return NextResponse.json({ mensaje: "Postulación recibida correctamente", id: postulacion.id }, { status: 201 })
  } catch (error) {
    console.error("Error al procesar postulación:", error)
    return NextResponse.json({ error: "Error al procesar la postulación" }, { status: 500 })
  }
}
