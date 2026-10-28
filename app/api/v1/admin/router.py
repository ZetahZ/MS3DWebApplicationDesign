import os
import uuid

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.usuario import Usuario
from app.models.producto import Producto

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])


def require_admin(
    x_user_id: int | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    # El front envía el id del usuario logueado en el header X-User-Id.
    # Verificamos en la base que ese usuario existe y es admin de verdad.
    if x_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el header X-User-Id con el usuario logueado",
        )
    user = db.query(Usuario).filter(Usuario.id == x_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Necesitás ser administrador para ver esto",
        )
    return user


# 1. Métricas generales
@router.get("/metrics")
def get_admin_metrics(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    total_users = db.query(Usuario).count()
    total_products = db.query(Producto).count()
    verified_users = db.query(Usuario).filter(Usuario.verificado == True).count()
    return {
        "total_users": total_users,
        "total_content": total_products,
        "active_sessions": verified_users,
    }


# 2. Lista de usuarios
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    users = db.query(Usuario).all()
    return [
        {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "is_admin": user.is_admin,
            "status": "activo" if user.verificado else "sin verificar",
        }
        for user in users
    ]


# 3. Control de contenido
@router.get("/content")
def get_admin_content(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    return []


# 4. Convertir un usuario en administrador
@router.put("/users/{user_id}/make-admin")
def make_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.is_admin = True
    db.commit()
    return {"mensaje": f"El usuario con ID {user_id} ahora es administrador"}


UPLOAD_DIR = "static/productos"


@router.post("/upload-imagen")
def subir_imagen(
    file: UploadFile = File(...),
    _admin: Usuario = Depends(require_admin),
):
    # Guarda la imagen en static/productos/ y devuelve la URL completa
    # para guardarla en la columna imagen del producto.
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".png", ".jpg", ".jpeg", ".webp", ".gif"):
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado")
    nombre = f"{uuid.uuid4().hex}{ext}"
    ruta = os.path.join(UPLOAD_DIR, nombre)
    with open(ruta, "wb") as f:
        f.write(file.file.read())
    return {"url": f"http://127.0.0.1:8000/static/productos/{nombre}"}
