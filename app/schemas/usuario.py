from pydantic import BaseModel, EmailStr


# Esquema para actualizar el estado del usuario (Suspender / Activar)
class UserStatusUpdate(BaseModel):
  status: str  # Ej: "activo", "suspendido"
  is_active: bool


# Esquema para cambiar o revocar roles (Hacer Admin / Quitar Admin)
class UserRoleUpdate(BaseModel):
  is_admin: bool  # O puedes usar `role: str` según prefieras manejarlo