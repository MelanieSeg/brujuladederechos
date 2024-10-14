from sqlalchemy import (
    create_engine, Column, String, Float, Integer, DateTime, Boolean, ForeignKey, Enum, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
import os
from dotenv import load_dotenv
import enum
from datetime import datetime


load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

# Crear el motor de SQLAlchemy con SSL
engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


from sqlalchemy import Column, String, ForeignKey, Integer, Boolean, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ConfigScraping(Base):
    __tablename__ = 'config_scraping'
    
    id = Column(String, primary_key=True)
    sitioWebId = Column(String, ForeignKey('sitio_web.id'), unique=True, nullable=False)
    frecuenciaScraping = Column(Integer, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    ultimaEjecucion = Column(DateTime, nullable=True)
    proximaEjecucion = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    sitioWeb = relationship('SitioWeb', back_populates='configScraping')

class SitioWeb(Base):
    __tablename__ = 'sitio_web'
    
    id = Column(String, primary_key=True)
    url = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    comentarios = relationship('ComentarioScrapped', back_populates='sitioWeb')
    configScraping = relationship('ConfigScraping', back_populates='sitioWeb', uselist=False)
    logScraping = relationship('LogScraping', back_populates='sitioWeb')

# Definir Enums según tu esquema de Prisma
class EstadoComentarioEnum(enum.Enum):
    PENDIENTE_CLASIFICACION = "PENDIENTE_CLASIFICACION"
    CLASIFICADO = "CLASIFICADO"

class RolesEnum(enum.Enum):
    ADMIN = "ADMIN"
    MODERADOR = "MODERADOR"

class ComentarioScraped(Base):
    __tablename__ = 'comentario_scraped'
    
    id = Column(String, primary_key=True)
    comentario = Column(String, nullable=False)
    sourceUrl = Column(String, nullable=False)
    scrapingId = Column(String, unique=True, nullable=False)
    autor = Column(String, nullable=True)
    fechaScraping = Column(DateTime, nullable=False)
    fechaClasificacion = Column(DateTime, nullable=True)
    clasificado = Column(Boolean, default=False, nullable=False)
    ibfScore = Column(Float, nullable=True)
    privacyScore = Column(Float, nullable=True)
    expressionScore = Column(Float, nullable=True)
    vulnerabilidad = Column(Float, default=1, nullable=False)
    intensidadPrivacidad = Column(Integer, nullable=True)
    elementoTiempo = Column(Integer, nullable=True)
    interesPublico = Column(Integer, nullable=True)
    caracterPersonaPublico = Column(Integer, nullable=True)
    origenInformacion = Column(Integer, nullable=True)
    empatiaPrivacidad = Column(Float, nullable=True)
    empatiaExpresion = Column(Float, nullable=True)
    estado = Column(String, default='PENDIENTE_CLASIFICACION', nullable=False)
    sitioWebId = Column(String, ForeignKey('sitio_web.id'), nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deletedAt = Column(DateTime, nullable=True)
    fechaComentario = Column(DateTime, nullable=True)
    
    comentarios = relationship('ComentarioClasificado', back_populates='comentarioScrapped')
    sitioWeb = relationship('SitioWeb', back_populates='comentarios')
    
    
class LogScraping(Base):
    __tablename__ = 'log_scraping'
    
    id = Column(String, primary_key=True)
    sitioWebId = Column(String, ForeignKey('sitio_web.id'), nullable=False)
    fechaInicio = Column(DateTime, nullable=False)
    fechaFin = Column(DateTime, nullable=False)
    comentariosScrapeados = Column(Integer, nullable=False)
    estado = Column(String, nullable=False)
    mensajeError = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    sitioWeb = relationship('SitioWeb', back_populates='logScraping')