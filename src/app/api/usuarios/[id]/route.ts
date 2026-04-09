import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(["ADMIN", "EVALUADOR"]).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const data = schema.safeParse(body)
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 })

  const updateData: Record<string, unknown> = { ...data.data }
  if (data.data.password) {
    updateData.password = await bcrypt.hash(data.data.password, 10)
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data: updateData,
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
  })
  return NextResponse.json(usuario)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const etapasActivas = await prisma.etapaEvaluacion.count({
    where: { evaluadorId: id, estado: { in: ["PENDIENTE", "ACTIVA"] } },
  })

  if (etapasActivas > 0) {
    return NextResponse.json({ error: "El usuario tiene evaluaciones activas y no puede eliminarse" }, { status: 409 })
  }

  await prisma.usuario.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
