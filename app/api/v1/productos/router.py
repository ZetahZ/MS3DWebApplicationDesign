import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from supabase import create_client, Client
from app.core.db import get_db
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse
from app.repositories.producto_repository import ProductoRepository
from app.api.v1.admin.router import require_admin
from app.models.usuario import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])

# Inicializar el cliente de Supabase (asegúrate de tener SUPABASE_URL y SUPABASE_KEY en tu .env)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.get("/", response_model=list[ProductoResponse])
def listar_productos(db: Session = Depends(get_db)):
    return ProductoRepository.get_all(db)

# --- NUEVO ENDPOINT: Filtrar productos por categoría ---
@router.get("/categoria/{categoria_id}", response_model=list[ProductoResponse])
def listar_productos_por_categoria(categoria_id: int, db: Session = Depends(get_db)):
    return ProductoRepository.get_by_categoria(db, categoria_id)

@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = ProductoRepository.get_by_id(db, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
async def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(None),
    precio: float = Form(...),
    stock: int = Form(...),
    categoria_id: int = Form(...),
    imagen: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    try:
        # 1. Leer los bytes del archivo enviado desde el frontend
        file_bytes = await imagen.read()
        
        # 2. Generar un nombre único para el archivo usando UUID
        file_extension = imagen.filename.split(".")[-1] if "." in imagen.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"productos/{unique_filename}"
        
        # 3. Subir la imagen al bucket público "productos" en Supabase Storage
        supabase.storage.from_("productos").upload(
            path=file_path,
            file=file_bytes,
            file_options={"content_type": imagen.content_type}
        )
        
        # 4. Obtener la URL pública absoluta de Supabase
        public_url_res = supabase.storage.from_("productos").get_public_url(file_path)
        public_url = public_url_res.get("publicUrl") if isinstance(public_url_res, dict) else public_url_res

        # 5. Armar el objeto de creación con la URL de la nube para pasarlo al repositorio
        # (Asumimos que tu esquema ProductoCreate acepta un campo para la imagen o URL)
        producto_data = ProductoCreate(
            nombre=nombre,
            descripcion=descripcion,
            precio=precio,
            stock=stock,
            categoria_id=categoria_id,
            imagen_url=public_url  # URL pública universal para todo el equipo
        )

        return ProductoRepository.create(db, producto_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir la imagen o crear el producto: {str(e)}"
        )

@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    producto = ProductoRepository.update(db, producto_id, data)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    eliminado = ProductoRepository.delete(db, producto_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return None