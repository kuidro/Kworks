import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // ── Usuarios administradores ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10)

  const admins = await Promise.all([
    prisma.usuario.upsert({
      where: { email: "admin@montblancchile.com" },
      update: {},
      create: { nombre: "Administrador", email: "admin@montblancchile.com", password: adminPassword, rol: "ADMIN" },
    }),
    prisma.usuario.upsert({
      where: { email: "c.yanquez@montblancchile.com" },
      update: {},
      create: { nombre: "Cristian Yanquez", email: "c.yanquez@montblancchile.com", password: adminPassword, rol: "ADMIN" },
    }),
  ])
  console.log("✅ Admins creados:", admins.map((u) => u.nombre).join(", "))

  // ── Evaluadores ───────────────────────────────────────────────────────────
  const evalPass = await bcrypt.hash("eval123", 10)

  const evaluadores = await Promise.all([
    prisma.usuario.upsert({
      where: { email: "i.ahumada@montblancchile.com" },
      update: {},
      create: { nombre: "Ignacio Ahumada", email: "i.ahumada@montblancchile.com", password: evalPass, rol: "EVALUADOR" },
    }),
    prisma.usuario.upsert({
      where: { email: "s.rojas@montblancchile.com" },
      update: {},
      create: { nombre: "Sebastian Rojas", email: "s.rojas@montblancchile.com", password: evalPass, rol: "EVALUADOR" },
    }),
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

  // ── Competencias ──────────────────────────────────────────────────────────
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

  // ── Tipos de proceso ──────────────────────────────────────────────────────
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

  // ── Proceso de prueba: Analistas Junior 1S 2026 ───────────────────────────
  const tipoJunior = await prisma.tipoProceso.findFirst({ where: { nombre: "Analista Junior" } })
  if (!tipoJunior) throw new Error("Tipo de proceso 'Analista Junior' no encontrado")

  let procesoJunior = await prisma.proceso.findFirst({
    where: { nombre: "Analistas Junior 1er Semestre 2026" },
  })

  if (!procesoJunior) {
    procesoJunior = await prisma.proceso.create({
      data: {
        nombre: "Analistas Junior 1er Semestre 2026",
        tipoProcesoId: tipoJunior.id,
        descripcion: "Proceso de selección de analistas junior para incorporación en el primer semestre de 2026. Se buscan profesionales recién egresados con interés en consultoría.",
        estado: "ABIERTO",
        fechaInicio: new Date("2026-01-15"),
        fechaFin: new Date("2026-03-31"),
      },
    })
    console.log("✅ Proceso creado:", procesoJunior.nombre)
  } else {
    console.log("⏭️  Proceso ya existe:", procesoJunior.nombre)
  }

  // ── 15 Postulantes de prueba ──────────────────────────────────────────────
  const postulantes = [
    {
      nombre: "Martina", apellido1: "González", apellido2: "Vargas",
      rut: "20.123.456-7", email: "martina.gonzalez@gmail.com",
      universidad: "Universidad de Chile", carrera: "Ingeniería Comercial",
      rankingNotas: "Top 10%",
      respuesta1: "Me interesa este proceso porque Montblanc es referente en consultoría en Chile. Mi diferencial es la combinación de habilidades analíticas con alta capacidad de comunicación, lo que me ha permitido destacar en proyectos universitarios.",
      respuesta2: "En mi última práctica profesional, enfrenté un error en un modelo financiero que afectaba el informe de un cliente. Identifiqué el problema, lo comuniqué al equipo y propuse una corrección que fue aprobada a tiempo.",
    },
    {
      nombre: "Sebastián", apellido1: "Morales", apellido2: "Pinto",
      rut: "20.234.567-8", email: "sebastian.morales@outlook.com",
      universidad: "Pontificia Universidad Católica de Chile", carrera: "Ingeniería Civil Industrial",
      rankingNotas: "Top 15%",
      respuesta1: "Montblanc representa una oportunidad para aplicar mis conocimientos en entornos reales de consultoría. Me destaco por mi capacidad analítica y manejo de datos con Python y Excel avanzado.",
      respuesta2: "Lideré un grupo de trabajo en un proyecto de optimización logística para una empresa del retail. Tuvimos conflictos de horario entre integrantes; reorganicé las tareas según disponibilidad y entregamos a tiempo con nota máxima.",
    },
    {
      nombre: "Camila", apellido1: "Vásquez", apellido2: "Rojas",
      rut: "20.345.678-9", email: "camila.vasquez@gmail.com",
      universidad: "Universidad Adolfo Ibáñez", carrera: "Ingeniería Comercial",
      rankingNotas: "Top 5%",
      respuesta1: "Busco iniciar mi carrera en consultoría por la diversidad de desafíos que presenta. Me distingue mi capacidad de adaptación y mi facilidad para trabajar en entornos de alta exigencia.",
      respuesta2: "Durante una competencia de casos, mi equipo debió reformular toda la propuesta a 24 horas de la presentación por un cambio en los datos. Coordiné la reescritura por secciones y presentamos una solución coherente y sólida.",
    },
    {
      nombre: "Felipe", apellido1: "Contreras", apellido2: "Muñoz",
      rut: "20.456.789-0", email: "felipe.contreras@hotmail.com",
      universidad: "Universidad de Santiago de Chile", carrera: "Ingeniería Civil en Gestión Industrial",
      rankingNotas: null,
      respuesta1: "Me atrae la posibilidad de trabajar con clientes de distintos sectores desde el inicio de mi carrera. Me diferencia mi experiencia en mejora de procesos durante mi práctica en una planta manufacturera.",
      respuesta2: "En mi práctica detecté una ineficiencia en el proceso de inventario que generaba sobrecostos. Propuse e implementé un sistema de control semanal que redujo el error de stock en un 40%.",
    },
    {
      nombre: "Isabella", apellido1: "Fernández", apellido2: "Castro",
      rut: "20.567.890-1", email: "isabella.fernandez@gmail.com",
      universidad: "Universidad de los Andes", carrera: "Administración de Empresas",
      rankingNotas: "Top 20%",
      respuesta1: "Quiero crecer profesionalmente en un ambiente desafiante como Montblanc. Me destaco por mi orientación al detalle, mi capacidad de síntesis y mi manejo de herramientas de análisis financiero.",
      respuesta2: "En un trabajo grupal de finanzas corporativas, un integrante no cumplió su parte días antes de la entrega. Redistribuí las tareas, comuniqué la situación al profesor y el equipo entregó completo y dentro del plazo.",
    },
    {
      nombre: "Diego", apellido1: "Ramírez", apellido2: "Soto",
      rut: "20.678.901-2", email: "diego.ramirez@gmail.com",
      universidad: "Universidad Técnica Federico Santa María", carrera: "Ingeniería Civil Industrial",
      rankingNotas: "Top 25%",
      respuesta1: "La consultoría me permite aplicar pensamiento sistémico para resolver problemas complejos. Me caracteriza mi capacidad de estructurar problemas y comunicar soluciones de forma clara a distintas audiencias.",
      respuesta2: "En un proyecto de rediseño de procesos universitario, el cliente cambió los requerimientos a mitad del trabajo. Hice un diagnóstico rápido del impacto, ajusté el plan y el equipo entregó una solución que superó las expectativas.",
    },
    {
      nombre: "Valentina", apellido1: "Cruz", apellido2: "Herrera",
      rut: "20.789.012-3", email: "valentina.cruz@gmail.com",
      universidad: "Universidad de Chile", carrera: "Ingeniería Industrial",
      rankingNotas: "Top 10%",
      respuesta1: "Mi interés en Montblanc nace de su reputación en proyectos de transformación organizacional. Me distingue una sólida formación cuantitativa combinada con habilidades interpersonales desarrolladas en trabajo voluntario.",
      respuesta2: "Participé en una competencia internacional de casos donde debimos analizar una empresa de logística con datos incompletos. Usé supuestos explícitos y análisis de sensibilidad para sostener nuestra recomendación.",
    },
    {
      nombre: "Andrés", apellido1: "Peña", apellido2: "Ibáñez",
      rut: "20.890.123-4", email: "andres.pena@yahoo.com",
      universidad: "Pontificia Universidad Católica de Chile", carrera: "Ingeniería Civil",
      rankingNotas: null,
      respuesta1: "Montblanc es la firma donde quiero iniciar mi carrera en consultoría de gestión. Me diferencio por mi formación técnica rigurosa y mi capacidad de ver el impacto de las decisiones a largo plazo.",
      respuesta2: "En mi proyecto de título, descubrí a mitad del desarrollo que el modelo de simulación tenía un error de parametrización. Lo identifiqué, recalibré el modelo y logré resultados incluso más robustos que los esperados.",
    },
    {
      nombre: "Sofía", apellido1: "Mendoza", apellido2: "Araya",
      rut: "20.901.234-5", email: "sofia.mendoza@gmail.com",
      universidad: "Universidad Adolfo Ibáñez", carrera: "Ingeniería Comercial",
      rankingNotas: "Top 5%",
      respuesta1: "Quiero desarrollarme en consultoría estratégica desde el inicio de mi carrera. Me distingue la combinación de visión de negocio, liderazgo de equipos y capacidad de análisis cuantitativo.",
      respuesta2: "Fui presidenta del Centro de Estudiantes durante un año. Gestioné un conflicto entre dos áreas del centro que bloqueaba la planificación anual. Medié entre ambas partes y establecimos acuerdos formales que desbloquearon el trabajo.",
    },
    {
      nombre: "Matías", apellido1: "Ríos", apellido2: "Campos",
      rut: "21.012.345-6", email: "matias.rios@hotmail.com",
      universidad: "Universidad de Santiago de Chile", carrera: "Ingeniería Comercial",
      rankingNotas: "Top 30%",
      respuesta1: "Me interesa Montblanc por sus proyectos en el sector financiero y minero. Mi valor diferencial es la experiencia práctica adquirida en una startup fintech durante mis estudios.",
      respuesta2: "En la startup donde trabajé, debimos pivotar nuestro modelo de negocios por cambios regulatorios. Lideré el análisis de alternativas y propuse la nueva estrategia que adoptó el equipo fundador.",
    },
    {
      nombre: "Gabriela", apellido1: "Torres", apellido2: "Núñez",
      rut: "21.123.456-7", email: "gabriela.torres@gmail.com",
      universidad: "Universidad de los Andes", carrera: "Ingeniería Comercial",
      rankingNotas: "Top 15%",
      respuesta1: "Elegí postular a Montblanc por su enfoque en soluciones concretas y medibles para sus clientes. Me destaco por mi rigor analítico, dominio de Excel y Power BI, y capacidad de síntesis ejecutiva.",
      respuesta2: "En un trabajo de estrategia empresarial, nuestro equipo perdió acceso a datos clave un día antes de presentar. Reconstruimos el análisis con fuentes secundarias y modelos proxy que el docente valoró como una solución creativa.",
    },
    {
      nombre: "Nicolás", apellido1: "Fuentes", apellido2: "Lara",
      rut: "21.234.567-8", email: "nicolas.fuentes@outlook.com",
      universidad: "Universidad Técnica Federico Santa María", carrera: "Ingeniería Civil en Informática",
      rankingNotas: null,
      respuesta1: "Busco aplicar mi formación técnica en contextos de negocio a través de la consultoría. Me diferencia el conocimiento en automatización de procesos y análisis de datos, competencias cada vez más valoradas en consultoría.",
      respuesta2: "Durante un hackathon, nuestro servidor cayó dos horas antes de la presentación. Migré rápidamente la demo a un entorno local, ajusté la presentación para mostrar capturas y logramos explicar el producto sin interrupciones.",
    },
    {
      nombre: "Catalina", apellido1: "Herrera", apellido2: "Molina",
      rut: "21.345.678-9", email: "catalina.herrera@gmail.com",
      universidad: "Pontificia Universidad Católica de Chile", carrera: "Administración de Empresas",
      rankingNotas: "Top 10%",
      respuesta1: "Montblanc es la firma ideal para comenzar en consultoría por la calidad de sus proyectos y equipo. Me distingue mi capacidad de estructurar problemas complejos y mi experiencia liderando proyectos de impacto social.",
      respuesta2: "Coordiné un proyecto de responsabilidad social universitario con 4 equipos distintos. Cuando uno de los equipos dejó de participar, redistribuí sus tareas, comuniqué el cambio a todos los involucrados y entregamos el proyecto completo.",
    },
    {
      nombre: "Tomás", apellido1: "Navarro", apellido2: "Gutiérrez",
      rut: "21.456.789-0", email: "tomas.navarro@gmail.com",
      universidad: "Universidad de Chile", carrera: "Ingeniería Civil Industrial",
      rankingNotas: "Top 20%",
      respuesta1: "Quiero iniciar mi carrera en Montblanc porque valoro su enfoque en generar impacto real en las organizaciones. Me diferencia la capacidad de trabajar con datos y de comunicar hallazgos de forma ejecutiva.",
      respuesta2: "En mi práctica en una empresa de retail, identifiqué que el proceso de devoluciones generaba pérdidas invisibles. Propuse un rediseño del flujo que fue aprobado por la gerencia y redujo los costos asociados en un 25%.",
    },
    {
      nombre: "Javiera", apellido1: "Sáez", apellido2: "Contreras",
      rut: "21.567.890-1", email: "javiera.saez@gmail.com",
      universidad: "Universidad Adolfo Ibáñez", carrera: "Psicología Organizacional",
      rankingNotas: "Top 15%",
      respuesta1: "Me postulo a Montblanc porque creo que la consultoría necesita más miradas desde las ciencias del comportamiento. Mi valor diferencial está en comprender el lado humano de las organizaciones, complementando el análisis cuantitativo.",
      respuesta2: "En una consultoría universitaria para una pyme, detectamos resistencia al cambio en el equipo directivo. Diseñé una estrategia de gestión del cambio que facilitó la adopción del nuevo modelo de trabajo propuesto.",
    },
  ]

  let creados = 0
  for (const p of postulantes) {
    const existe = await prisma.postulacion.findFirst({
      where: { email: p.email, procesoId: procesoJunior.id },
    })
    if (!existe) {
      await prisma.postulacion.create({
        data: {
          procesoId: procesoJunior.id,
          tipoProcesoId: tipoJunior.id,
          nombre: p.nombre,
          apellido1: p.apellido1,
          apellido2: p.apellido2 || null,
          rut: p.rut,
          email: p.email,
          universidad: p.universidad,
          carrera: p.carrera,
          rankingNotas: p.rankingNotas || null,
          respuesta1: p.respuesta1,
          respuesta2: p.respuesta2,
          estado: "PENDIENTE",
        },
      })
      creados++
    }
  }
  console.log(`✅ Postulantes de prueba creados: ${creados} (${postulantes.length - creados} ya existían)`)

  console.log("\n🎉 Seed completado exitosamente!")
  console.log("\n📋 Credenciales de acceso:")
  console.log("   Admin:     admin@montblancchile.com       / admin123")
  console.log("   Admin:     c.yanquez@montblancchile.com   / admin123")
  console.log("   Evaluador: i.ahumada@montblancchile.com   / eval123")
  console.log("   Evaluador: s.rojas@montblancchile.com     / eval123")
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
