from app.core.db import categorias
from app.models.categoria import Categoria

class CategoriaRepository:
    @staticmethod
    def get_all() -> list[Categoria]:
        return categorias

    @staticmethod
    def get_by_id(categoria_id: int) -> Categoria | None:
        for cat in categorias:
            if cat.id == categoria_id:
                return cat
        return None