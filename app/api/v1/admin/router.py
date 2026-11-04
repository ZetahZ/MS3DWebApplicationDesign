import os
import uuid

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from supabase import create_client, Client

from app.core.db import get_db
from app.models.usuario import Usuario
from app.models.producto import Producto

from dotenv import load_dotenv
load_dotenv()  # Esto lee el archivo .env de la raíz

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

# Inicializar el cliente de Supabase usando las variables de entorno
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


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


# 5. Subida de imágenes a Supabase Storage
@router.post("/upload-imagen")
async def subir_imagen(
    file: UploadFile = File(...),
    _admin: Usuario = Depends(require_admin),
):
    try:
        file_bytes = await file.read()
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in (".png", ".jpg", ".jpeg", ".webp", ".gif"):
            raise HTTPException(status_code=400, detail="Formato de imagen no soportado")
            
        nombre = f"{uuid.uuid4().hex}{ext}"
        file_path = f"productos/{nombre}"
        
        # Sube el archivo al bucket público "productos" de Supabase
        supabase.storage.from_("productos").upload(
            path=file_path,
            file=file_bytes,
            file_options={"content_type": file.content_type}
        )
        
        # Obtiene la URL pública absoluta
        public_url_res = supabase.storage.from_("productos").get_public_url(file_path)
        public_url = public_url_res.get("publicUrl") if isinstance(public_url_res, dict) else public_url_res

        return {"url": public_url}
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al subir la imagen a Supabase Storage: {str(e)}"
        )