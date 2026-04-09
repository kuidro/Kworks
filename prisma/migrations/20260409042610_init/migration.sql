-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'EVALUADOR');

-- CreateEnum
CREATE TYPE "EstadoProceso" AS ENUM ('EN_PROGRESO', 'COMPLETADO', 'TERMINADO');

-- CreateEnum
CREATE TYPE "EstadoEtapa" AS ENUM ('PENDIENTE', 'ACTIVA', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('AVANZA', 'TERMINA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'EVALUADOR',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidato" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "cargo" TEXT,
    "linkedin" TEXT,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Archivo" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "subidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Archivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcesoEvaluacion" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "estado" "EstadoProceso" NOT NULL DEFAULT 'EN_PROGRESO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcesoEvaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtapaEvaluacion" (
    "id" TEXT NOT NULL,
    "procesoId" TEXT NOT NULL,
    "evaluadorId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "estado" "EstadoEtapa" NOT NULL DEFAULT 'PENDIENTE',
    "decision" "Decision",
    "comentarioGeneral" TEXT,
    "completadoEn" TIMESTAMP(3),

    CONSTRAINT "EtapaEvaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competencia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Competencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtapaCompetencia" (
    "id" TEXT NOT NULL,
    "etapaId" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,
    "puntaje" INTEGER,
    "comentario" TEXT,

    CONSTRAINT "EtapaCompetencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Archivo" ADD CONSTRAINT "Archivo_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesoEvaluacion" ADD CONSTRAINT "ProcesoEvaluacion_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaEvaluacion" ADD CONSTRAINT "EtapaEvaluacion_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoEvaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaEvaluacion" ADD CONSTRAINT "EtapaEvaluacion_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaCompetencia" ADD CONSTRAINT "EtapaCompetencia_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "EtapaEvaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaCompetencia" ADD CONSTRAINT "EtapaCompetencia_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
