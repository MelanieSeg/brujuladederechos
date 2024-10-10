-- CreateEnum
CREATE TYPE "TipoAccion" AS ENUM ('MODIFICACION', 'ELIMINACION');

-- CreateEnum
CREATE TYPE "MotivoModificacion" AS ENUM ('REVISION_MANUAL', 'ERROR_CORRECCION', 'ACTUALIZACION_RUTINARIA', 'RECLASIFICACION_IA', 'CAMBIO_POLITICA', 'REVISION_LEGAL', 'CORRECCION_DATOS', 'OTRO');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('EXITOSO', 'FALLIDO');

-- CreateEnum
CREATE TYPE "TipoReporte" AS ENUM ('DIARIO', 'SEMANAL', 'MENSUAL', 'PERSONALIZADO');

-- CreateEnum
CREATE TYPE "FormatoReporte" AS ENUM ('CSV', 'EXCEL');

-- CreateEnum
CREATE TYPE "Gravedad" AS ENUM ('LEVE', 'MODERADA', 'GRAVE');

-- CreateEnum
CREATE TYPE "Sentimiento" AS ENUM ('POSITIVO', 'NEUTRO', 'NEGATIVO');

-- CreateEnum
CREATE TYPE "EstadoComentario" AS ENUM ('PENDIENTE_CLASIFICACION', 'CLASIFICADO');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'MODERADOR');

-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('REFRESH', 'ACCESS', 'RESET_PASSWORD', 'VERIFICATION');

-- CreateTable
CREATE TABLE "ComentarioScraped" (
    "id" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "scrapingId" TEXT NOT NULL,
    "autor" TEXT,
    "fechaScraping" TIMESTAMP(3) NOT NULL,
    "fechaClasificacion" TIMESTAMP(3),
    "clasificado" BOOLEAN NOT NULL DEFAULT false,
    "ibfScore" DOUBLE PRECISION,
    "privacyScore" DOUBLE PRECISION,
    "expressionScore" DOUBLE PRECISION,
    "vulnerabilidad" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "intensidadPrivacidad" INTEGER,
    "elementoTiempo" INTEGER,
    "interesPublico" INTEGER,
    "caracterPersonaPublico" INTEGER,
    "origenInformacion" INTEGER,
    "empatiaPrivacidad" DOUBLE PRECISION,
    "empatiaExpresion" DOUBLE PRECISION,
    "estado" "EstadoComentario" NOT NULL DEFAULT 'PENDIENTE_CLASIFICACION',
    "sitioWebId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "fechaComentario" TIMESTAMP(3),

    CONSTRAINT "ComentarioScraped_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioClasificado" (
    "id" TEXT NOT NULL,
    "clasificadorId" TEXT NOT NULL,
    "fechaClasificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "clasificacion" TEXT,
    "comentarioScrapedId" TEXT NOT NULL,

    CONSTRAINT "ComentarioClasificado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT NOT NULL,
    "rol" "Roles" NOT NULL DEFAULT 'MODERADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigScraping" (
    "id" TEXT NOT NULL,
    "sitioWebId" TEXT NOT NULL,
    "frecuenciaScraping" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimaEjecucion" TIMESTAMP(3),
    "proximaEjecucion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigScraping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitioWeb" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitioWeb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoReporte" NOT NULL,
    "query" TEXT NOT NULL,
    "formato" "FormatoReporte" NOT NULL DEFAULT 'CSV',
    "ultimoGenerado" TIMESTAMP(3),
    "proximoGenerar" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogScraping" (
    "id" TEXT NOT NULL,
    "sitioWebId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "comentariosScrapeados" INTEGER NOT NULL,
    "estado" "Estado" NOT NULL,
    "mensajeError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogScraping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogClasificacionIA" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelo_version" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL,
    "estado" "Estado" NOT NULL,
    "mensaje_error" TEXT,

    CONSTRAINT "LogClasificacionIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalles" JSONB NOT NULL,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "tipoAccion" "TipoAccion" NOT NULL,
    "motivoModificacion" "MotivoModificacion" NOT NULL,
    "cambiosAnteriores" JSONB,
    "cambiosNuevos" JSONB,
    "detalles" TEXT,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComentarioScraped_scrapingId_key" ON "ComentarioScraped"("scrapingId");

-- CreateIndex
CREATE INDEX "ComentarioScraped_sitioWebId_idx" ON "ComentarioScraped"("sitioWebId");

-- CreateIndex
CREATE INDEX "ComentarioScraped_estado_idx" ON "ComentarioScraped"("estado");

-- CreateIndex
CREATE INDEX "ComentarioClasificado_comentarioScrapedId_idx" ON "ComentarioClasificado"("comentarioScrapedId");

-- CreateIndex
CREATE INDEX "ComentarioClasificado_clasificadorId_idx" ON "ComentarioClasificado"("clasificadorId");

-- CreateIndex
CREATE INDEX "ComentarioClasificado_clasificacion_idx" ON "ComentarioClasificado"("clasificacion");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigScraping_sitioWebId_key" ON "ConfigScraping"("sitioWebId");

-- CreateIndex
CREATE UNIQUE INDEX "SitioWeb_url_key" ON "SitioWeb"("url");

-- CreateIndex
CREATE INDEX "LogScraping_sitioWebId_idx" ON "LogScraping"("sitioWebId");

-- CreateIndex
CREATE INDEX "LogScraping_estado_idx" ON "LogScraping"("estado");

-- CreateIndex
CREATE INDEX "LogClasificacionIA_estado_idx" ON "LogClasificacionIA"("estado");

-- CreateIndex
CREATE INDEX "LogAuditoria_usuarioId_idx" ON "LogAuditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "LogAuditoria_entidad_entidadId_idx" ON "LogAuditoria"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "Auditoria_usuarioId_idx" ON "Auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "Auditoria_tipoAccion_idx" ON "Auditoria"("tipoAccion");

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_token_key" ON "UserToken"("token");

-- CreateIndex
CREATE INDEX "UserToken_expireAt_idx" ON "UserToken"("expireAt");

-- CreateIndex
CREATE INDEX "UserToken_tipo_idx" ON "UserToken"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_userId_tipo_key" ON "UserToken"("userId", "tipo");

-- AddForeignKey
ALTER TABLE "ComentarioScraped" ADD CONSTRAINT "ComentarioScraped_sitioWebId_fkey" FOREIGN KEY ("sitioWebId") REFERENCES "SitioWeb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioClasificado" ADD CONSTRAINT "ComentarioClasificado_clasificadorId_fkey" FOREIGN KEY ("clasificadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioClasificado" ADD CONSTRAINT "ComentarioClasificado_comentarioScrapedId_fkey" FOREIGN KEY ("comentarioScrapedId") REFERENCES "ComentarioScraped"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigScraping" ADD CONSTRAINT "ConfigScraping_sitioWebId_fkey" FOREIGN KEY ("sitioWebId") REFERENCES "SitioWeb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogScraping" ADD CONSTRAINT "LogScraping_sitioWebId_fkey" FOREIGN KEY ("sitioWebId") REFERENCES "SitioWeb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
