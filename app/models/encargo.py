from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.db import Base

class Encargo(Base):
    __tablename__ = "encargos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_nombre = Column(String, nullable=False) # Nombre a mostrar (ej: Valentina R.)
    producto_nombre = Column(String, nullable=False) # Nombre de la pieza o modelo
    cantidad = Column(Integer, default=1)
    especificaciones = Column(String, nullable=True) # ej: "Color negro matte" / "PLA Silk gold"
    
    # Estado del pedido: 'por_imprimir', 'en_impresion', 'completado'
    estado = Column(String, default="por_imprimir") 
    progreso = Column(Integer, default=0) # Porcentaje de impresión (0 a 100)
    
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Opcional: Vincular con el usuario que lo encargó
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    usuario = relationship("Usuario")