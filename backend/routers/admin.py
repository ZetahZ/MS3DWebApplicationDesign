from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

# 1. Métricas generales
@router.get("/metrics")
def get_admin_metrics(db: Session = Depends(get_db)):
    total_users = db.query(models.Usuario).count()
    return {
        "total_users": total_users,
        "total_content": 0,
        "active_sessions": 1
    }

# 2. Lista de usuarios
@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(models.Usuario).all()
    return [
        {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "status": "activo"
        }
        for user in users
    ]

# 3. Control de contenido
@router.get("/content")
def get_admin_content(db: Session = Depends(get_db)):
    return []