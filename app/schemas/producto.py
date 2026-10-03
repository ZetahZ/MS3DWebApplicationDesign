from pydantic import BaseModel, ConfigDict
from app.schemas.categoria import CategoriaResponse

class ProductoBase(BaseModel):
    nombre: str
    precio: float
    stock: int = 0
    activo: bool = True
    categoria_id: int

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: str | None = None
    precio: float | None = None
    stock: int | None = None
    activo: bool | None = None
    categoria_id: int | None = None

class ProductoResponse(ProductoBase):
    id: int
    categoria: CategoriaResponse | None = None

    model_config = ConfigDict(from_attributes=True)