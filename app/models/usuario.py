from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from app.core.db import Base  # o la clase Base que usen en core/db.py


class Usuario(Base):
  __tablename__ = "usuarios"

  id = Column(Integer, primary_key=True, index=True)
  nombre = Column(String, nullable=True)
  email = Column(String, unique=True, index=True, nullable=False)
  password = Column(String, nullable=False)
  verificado = Column(Boolean, default=False)
  codigo_verificacion = Column(String, nullable=True)
  is_admin = Column(
      Boolean, default=False
  )  # Opcional: puedes mantener esto o cambiarlo a un campo `role = Column(String, default="user")` para que coincida exactamente con tu tabla del panel.

  # --- NUEVOS CAMPOS AÑADIDOS ---
  status = Column(
      String, default="activo"
  )  # Para reflejar "activo", "suspendido", etc. en tu panel
  is_active = Column(Boolean, default=True)  # Para bloquear el login si se suspende
  is_deleted = Column(
      Boolean, default=False
  )  # Para la Eliminación Lógica (Soft Delete)
  deleted_at = Column(
      DateTime(timezone=True), nullable=True
  )  # Registro de cuándo fue eliminado lógicamente