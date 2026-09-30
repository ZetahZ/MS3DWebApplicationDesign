from pydantic import BaseModel, Field

# (d) Schema para anidar la categoría en la respuesta
class CategoriaOut(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True

# (a) ProductoBase con nombre y precio
class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    precio: float = Field(..., ge=0)

# (b) ProductoCreate hereda de ProductoBase y añade stock y categoria_id
class ProductoCreate(ProductoBase):
    stock: int = Field(..., ge=0)
    categoria_id: int = Field(..., ge=1)
    activo: bool = True

# (c) ProductoUpdate con todos los campos opcionales para el PUT parcial
class ProductoUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=2, max_length=100)
    precio: float | None = Field(None, ge=0)
    stock: int | None = Field(None, ge=0)
    categoria_id: int | None = Field(None, ge=1)
    activo: bool | None = None

# (e) ProductoResponse con id, stock, activo y el objeto anidado categoria
class ProductoResponse(ProductoBase):
    id: int
    stock: int
    activo: bool
    categoria: CategoriaOut

    class Config:
        from_attributes = True