from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UserRoleUpdate, UserStatusUpdate

router = APIRouter(prefix="/usuarios", tags=["Gestión de Usuarios"])

# 1. Gestión de Estados (Suspender / Activar)
@router.patch("/{user_id}/status")
def update_user_status(
    user_id: int, status_data: UserStatusUpdate, db: Session = Depends(get_db)
):
    user = (
        db.query(Usuario)
        .filter(Usuario.id == user_id, Usuario.is_deleted == False)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    user.status = status_data.status
    user.is_active = status_data.is_active
    db.commit()
    db.refresh(user)
    return {
        "message": f"Estado actualizado a '{user.status}'",
        "user_id": user.id,
    }


# 2. Cambio o Revocación de Roles (Hacer Admin / Quitar Admin)
@router.patch("/{user_id}/role")
def update_user_role(
    user_id: int, role_data: UserRoleUpdate, db: Session = Depends(get_db)
):
    user = (
        db.query(Usuario)
        .filter(Usuario.id == user_id, Usuario.is_deleted == False)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    user.is_admin = role_data.is_admin
    db.commit()
    db.refresh(user)
    return {
        "message": (
            "Rol de administrador actualizado"
            if user.is_admin
            else "Privilegios de administrador revocados"
        ),
        "user_id": user.id,
    }


# 3. Eliminación Lógica (Soft Delete)
@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def soft_delete_user(user_id: int, db: Session = Depends(get_db)):
    user = (
        db.query(Usuario)
        .filter(Usuario.id == user_id, Usuario.is_deleted == False)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    # El código de borrado ahora está adentro de su propia función correctamente
    user.is_deleted = True
    user.is_active = False
    user.status = "eliminado"
    user.deleted_at = datetime.utcnow()

    db.commit()
    return {"message": "Usuario eliminado lógicamente con éxito", "user_id": user.id}


# 4. Listar todos los usuarios activos
@router.get("/")
def get_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).filter(Usuario.is_deleted == False).all()
    return usuarios