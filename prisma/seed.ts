import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando seed...")

  // Usuario administrador
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@montblanc.cl" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@montblanc.cl",
      password: adminPassword,
      rol: "ADMIN",
    },
  })
  console.log("✅ Admin creado:", admin.email)

  // Evaluadores
  const evalPass = await bcrypt.hash("eval123", 10)
  const evaluadores = await Promise.all([
    prisma.usuario.upsert({
      where: { email: "carolina.reyes@montblanc.cl" },
      update: {},
      create: { nombre: "Carolina Reyes", email: "carolina.reyes@montblanc.cl", password: evalPass, rol: "EVALUADOR" },
    }),
    prisma.usuario.upsert({
      where: { email: "rodrigo.morales@montblanc.cl" },
      update: {},
      create: { nombre: "Rodrigo Morales", email: "rodrigo.morales@montblanc.cl", password: evalPass, rol: "EVALUADOR" },
    }),
    prisma.usuario.upsert({
      where: { email: "valentina.soto@montblanc.cl" },
      update: {},
      create: { nombre: "Valentina Soto", email: "valentina.soto@montblanc.cl", password: evalPass, rol: "EVALUADOR" },
    }),
  ])
  console.log("✅ Evaluadores creados:", evaluadores.map((e) => e.nombre).join(", "))

  // Competencias
  const competenciasData = [
    { nombre: "Liderazgo", descripcion: "Capacidad de guiar y motivar equipos hacia objetivos comunes" },
    { nombre: "Comunicación", descripcion: "Habilidad para transmitir ideas de forma clara y efectiva" },
    { nombre: "Trabajo en equipo", descripcion: "Disposición para colaborar y contribuir al logro grupal" },
    { nombre: "Resolución de problemas", descripcion: "Capacidad analítica para identificar y resolver desafíos" },
    { nombre: "Orientación al cliente", descripcion: "Enfoque en satisfacer las necesidades del cliente" },
    { nombre: "Adaptabilidad", descripcion: "Flexibilidad ante cambios y nuevos contextos" },
    { nombre: "Iniciativa", descripcion: "Proactividad y disposición para emprender acciones sin necesidad de instrucción" },
    { nombre: "Pensamiento estratégico", descripcion: "Visión a largo plazo y capacidad para planificar" },
    { nombre: "Gestión del tiempo", descripcion: "Organización eficiente de tareas y prioridades" },
    { nombre: "Ética profesional", descripcion: "Integridad, honestidad y cumplimiento de principios en el trabajo" },
  ]

  for (const comp of competenciasData) {
    const existe = await prisma.competencia.findFirst({ where: { nombre: comp.nombre } })
    if (!existe) await prisma.competencia.create({ data: comp })
  }
  console.log("✅ Competencias creadas:", competenciasData.length)

  console.log("\n🎉 Seed completado exitosamente!")
  console.log("\n📋 Credenciales de acceso:")
  console.log("   Admin:     admin@montblanc.cl / admin123")
  console.log("   Evaluador: carolina.reyes@montblanc.cl / eval123")
  console.log("   Evaluador: rodrigo.morales@montblanc.cl / eval123")
  console.log("   Evaluador: valentina.soto@montblanc.cl / eval123")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
