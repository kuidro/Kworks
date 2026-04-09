import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"

const prisma = new PrismaClient()

const candidatos = [
  {
    nombre: "Martina González Vargas",
    email: "martina.gonzalez@gmail.com",
    telefono: "+56 9 8123 4567",
    cargo: "Gerente de Marketing",
    linkedin: "linkedin.com/in/martinagonzalez",
    notas: "Candidata con experiencia en retail y consumo masivo. MBA en Universidad de Chile.",
  },
  {
    nombre: "Sebastián Morales Pinto",
    email: "sebastian.morales@outlook.com",
    telefono: "+56 9 7654 3210",
    cargo: "Analista de Datos Senior",
    linkedin: "linkedin.com/in/sebastianmorales",
    notas: "Especialista en Python y SQL. 5 años de experiencia en banca.",
  },
  {
    nombre: "Camila Vásquez Rojas",
    email: "camila.vasquez@gmail.com",
    telefono: "+56 9 9234 5678",
    cargo: "Directora de Recursos Humanos",
    linkedin: "linkedin.com/in/camilavasquez",
    notas: "Psicóloga organizacional con 10 años de experiencia en empresas multinacionales.",
  },
  {
    nombre: "Felipe Contreras Muñoz",
    email: "felipe.contreras@hotmail.com",
    telefono: "+56 9 6543 2109",
    cargo: "Ingeniero de Software",
    linkedin: "linkedin.com/in/felipecontreras",
    notas: "Full stack developer con experiencia en React y Node.js. Postgrado en Canadá.",
  },
  {
    nombre: "Isabella Fernández Castro",
    email: "isabella.fernandez@gmail.com",
    telefono: "+56 9 8765 4321",
    cargo: "Jefa de Finanzas",
    linkedin: "linkedin.com/in/isabellafernandez",
    notas: "CPA con experiencia en auditoría Big 4. Manejo avanzado de SAP.",
  },
  {
    nombre: "Diego Ramírez Soto",
    email: "diego.ramirez@empresa.cl",
    telefono: "+56 9 5432 1098",
    cargo: "Gerente Comercial",
    linkedin: "linkedin.com/in/diegoramirez",
    notas: "12 años liderando equipos de ventas en el sector inmobiliario.",
  },
  {
    nombre: "Valentina Cruz Herrera",
    email: "valentina.cruz@gmail.com",
    telefono: "+56 9 9876 5432",
    cargo: "Coordinadora de Proyectos",
    linkedin: "linkedin.com/in/valentinacruz",
    notas: "PMP certificada. Experiencia en proyectos de transformación digital.",
  },
  {
    nombre: "Andrés Peña Ibáñez",
    email: "andres.pena@yahoo.com",
    telefono: "+56 9 4321 0987",
    cargo: "Director de Operaciones",
    linkedin: "linkedin.com/in/andrespena",
    notas: "Ingeniero Industrial. Especialista en Lean Manufacturing y mejora continua.",
  },
  {
    nombre: "Sofía Mendoza Araya",
    email: "sofia.mendoza@gmail.com",
    telefono: "+56 9 7890 1234",
    cargo: "Jefa de Marketing Digital",
    linkedin: "linkedin.com/in/sofiamendoza",
    notas: "Especialista en performance marketing. Certificada en Google y Meta Ads.",
  },
  {
    nombre: "Matías Ríos Campos",
    email: "matias.rios@hotmail.com",
    telefono: "+56 9 6789 0123",
    cargo: "Subgerente de Logística",
    linkedin: "linkedin.com/in/matiasrios",
    notas: "8 años de experiencia en supply chain y distribución a nivel nacional.",
  },
]

async function main() {
  console.log("🌱 Creando candidatos de prueba...")

  for (const candidato of candidatos) {
    const existe = await prisma.candidato.findFirst({
      where: { email: candidato.email },
    })
    if (!existe) {
      await prisma.candidato.create({ data: candidato })
      console.log(`✅ ${candidato.nombre}`)
    } else {
      console.log(`⏭️  Ya existe: ${candidato.nombre}`)
    }
  }

  console.log("\n🎉 ¡10 candidatos de prueba creados exitosamente!")
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
