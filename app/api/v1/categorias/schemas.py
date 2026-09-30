from pydantic import BaseModel, Field

class CategoriaBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=50)

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        from_attributes = True