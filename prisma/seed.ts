import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // Usuario administrador
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@montblancchile.com" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@montblancchile.com",
      password: adminPassword,
      rol: "ADMIN",
    },
  })
  console.log("✅ Admin creado:", admin.email)

  // Evaluadores
  const evalPass = await bcrypt.hash("eval123", 10)
  const evaluadores = await Promise.all([
    prisma.usuario.upsert({
      where: { email: "carolina.reyes@montblancchile.com" },
      update: {},
      create: { nombre: "Carolina Reyes", email: "carolina.reyes@montblancchile.com", password: evalPass, rol: "EVALUADOR" },
    }),
    prisma.usuario.upsert({
      where: { email: "rodrigo.morales@montblancchile.com" },
      update: {},
      create: { nombre: "Rodrigo Morales", email: "rodrigo.morales@montblancchile.com", password: evalPass, rol: "EVALUADOR" },
    }),
    prisma.usuario.upsert({
      where: { email: "valentina.soto@montblancchile.com" },
      update: {},
      create: { nombre: "Valentina Soto", email: "valentina.soto@montblancchile.com", password: evalPass, rol: "EVALUADOR" },
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

  // Tipos de proceso
  const tiposData = [
    { nombre: "Analista Junior", descripcion: "Procesos para incorporación de profesionales en etapa inicial de carrera" },
    { nombre: "Analista Senior", descripcion: "Procesos para profesionales con experiencia en el área" },
    { nombre: "Gerencia", descripcion: "Procesos para cargos directivos y de alta responsabilidad" },
    { nombre: "Consultor", descripcion: "Procesos para consultores externos e internos" },
  ]

  for (const tipo of tiposData) {
    const existe = await prisma.tipoProceso.findFirst({ where: { nombre: tipo.nombre } })
    if (!existe) await prisma.tipoProceso.create({ data: tipo })
  }
  console.log("✅ Tipos de proceso creados:", tiposData.length)

  console.log("\n🎉 Seed completado exitosamente!")
  console.log("\n📋 Credenciales de acceso:")
  console.log("   Admin:     admin@montblancchile.com / admin123")
  console.log("   Evaluador: carolina.reyes@montblancchile.com / eval123")
  console.log("   Evaluador: rodrigo.morales@montblancchile.com / eval123")
  console.log("   Evaluador: valentina.soto@montblancchile.com / eval123")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
