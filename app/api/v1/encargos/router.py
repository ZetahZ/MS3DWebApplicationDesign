from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.encargo import Encargo
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/encargos", tags=["Panel de Creador / Encargos"])

class EncargoCreate(BaseModel):
    cliente_nombre: str
    producto_nombre: str
    cantidad: int = 1
    especificaciones: Optional[str] = None
    estado: str = "por_imprimir"
    progreso: int = 0
    usuario_id: Optional[int] = None  # Vinculado al usuario

class EncargoUpdate(BaseModel):
    cliente_nombre: Optional[str] = None
    producto_nombre: Optional[str] = None
    cantidad: Optional[int] = None
    especificaciones: Optional[str] = None
    estado: Optional[str] = None
    progreso: Optional[int] = None
    usuario_id: Optional[int] = None

# 1. Listar todos o filtrar por usuario_id ?usuario_id=X
@router.get("/", response_model=List[dict])
def listar_encargos(usuario_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Encargo)
    
    if usuario_id is not None:
        query = query.filter(Encargo.usuario_id == usuario_id)
        
    encargos = query.all()
    return [
        {
            "id": e.id,
            "cliente_nombre": e.cliente_nombre,
            "producto_nombre": e.producto_nombre,
            "cantidad": e.cantidad,
            "especificaciones": e.especificaciones,
            "estado": e.estado,
            "progreso": e.progreso,
            "usuario_id": e.usuario_id,
            "fecha_creacion": e.fecha_creacion.strftime("%Y-%m-%d") if e.fecha_creacion else ""
        }
        for e in encargos
    ]

# 2. Obtener un encargo específico por ID
@router.get("/{encargo_id}")
def obtener_encargo(encargo_id: int, db: Session = Depends(get_db)):
    encargo = db.query(Encargo).filter(Encargo.id == encargo_id).first()
    if not encargo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Encargo no encontrado")
    return {
        "id": encargo.id,
        "cliente_nombre": encargo.cliente_nombre,
        "producto_nombre": encargo.producto_nombre,
        "cantidad": encargo.cantidad,
        "especificaciones": encargo.especificaciones,
        "estado": encargo.estado,
        "progreso": encargo.progreso,
        "usuario_id": encargo.usuario_id,
        "fecha_creacion": encargo.fecha_creacion.strftime("%Y-%m-%d") if encargo.fecha_creacion else ""
    }

# 3. Crear un nuevo encargo con su usuario_id
@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_encargo(encargo: EncargoCreate, db: Session = Depends(get_db)):
    nuevo = Encargo(**encargo.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"message": "Encargo creado exitosamente", "id": nuevo.id}

# 4. Actualizar encargo
@router.put("/{encargo_id}")
def actualizar_encargo(encargo_id: int, encargo_data: EncargoUpdate, db: Session = Depends(get_db)):
    encargo = db.query(Encargo).filter(Encargo.id == encargo_id).first()
    if not encargo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Encargo no encontrado")
    
    data_dict = encargo_data.dict(exclude_unset=True)
    for key, value in data_dict.items():
        setattr(encargo, key, value)
        
    db.commit()
    db.refresh(encargo)
    return {"message": "Encargo actualizado correctamente"}

# 5. Eliminar encargo
@router.delete("/{encargo_id}")
def eliminar_encargo(encargo_id: int, db: Session = Depends(get_db)):
    encargo = db.query(Encargo).filter(Encargo.id == encargo_id).first()
    if not encargo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Encargo no encontrado")
    db.delete(encargo)
    db.commit()
    return {"message": "Encargo eliminado correctamente"}