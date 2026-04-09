import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(["ADMIN", "EVALUADOR"]).default("EVALUADOR"),
})

export async function GET() {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(usuarios)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const data = schema.safeParse(body)
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 })

  const existe = await prisma.usuario.findUnique({ where: { email: data.data.email } })
  if (existe) return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })

  const hash = await bcrypt.hash(data.data.password, 10)
  const usuario = await prisma.usuario.create({
    data: { ...data.data, password: hash },
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
  })
  return NextResponse.json(usuario, { status: 201 })
}
