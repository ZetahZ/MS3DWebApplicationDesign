from fastapi import APIRouter, HTTPException, status
from app.api.v1.categorias.schemas import CategoriaResponse
from app.core.db import categorias

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias():
    return categorias

@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obtener_categoria(categoria_id: int):
    for cat in categorias:
        if cat.id == categoria_id:
            return cat
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail="Categoría no encontrada"
    )