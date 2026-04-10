import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { estado } = body

    if (!["SELECCIONADO", "DESCARTADO", "PENDIENTE"].includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    const postulacion = await prisma.postulacion.findUnique({
      where: { id },
      include: { candidatoEnProceso: true },
    })

    if (!postulacion) {
      return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 })
    }

    // Update postulacion status
    const updated = await prisma.postulacion.update({
      where: { id },
      data: { estado },
    })

    // If SELECCIONADO, create CandidatoEnProceso if it doesn't exist
    if (estado === "SELECCIONADO" && !postulacion.candidatoEnProceso) {
      await prisma.candidatoEnProceso.create({
        data: {
          procesoId: postulacion.procesoId,
          postulacionId: id,
        },
      })
    }

    // If DESCARTADO and CandidatoEnProceso exists, mark as DESCARTADO
    if (estado === "DESCARTADO" && postulacion.candidatoEnProceso) {
      await prisma.candidatoEnProceso.update({
        where: { id: postulacion.candidatoEnProceso.id },
        data: { estado: "DESCARTADO" },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error al actualizar postulación:", error)
    return NextResponse.json({ error: "Error al actualizar postulación" }, { status: 500 })
  }
}
