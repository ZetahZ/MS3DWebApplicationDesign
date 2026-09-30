from app.core.db import productos, categorias, bump_producto_id
from app.models.producto import Producto
from app.api.v1.productos.schemas import ProductoCreate, ProductoUpdate

class ProductoRepository:

    # (a) Helpers privados _find_categoria(id) y _to_dict(p)
    @staticmethod
    def _find_categoria(categoria_id: int):
        for cat in categorias:
            if cat.id == categoria_id:
                return cat
        return None

    @classmethod
    def _to_dict(cls, p: Producto) -> dict:
        cat = cls._find_categoria(p.categoria_id)
        return {
            "id": p.id,
            "nombre": p.nombre,
            "precio": p.precio,
            "stock": p.stock,
            "activo": p.activo,
            "categoria": {"id": cat.id, "nombre": cat.nombre} if cat else {"id": p.categoria_id, "nombre": "Desconocida"}
        }

    # (b) list_productos() y get_by_id(id)
    @classmethod
    def list_productos(cls) -> list[dict]:
        return [cls._to_dict(p) for p in productos]

    @classmethod
    def get_by_id(cls, producto_id: int) -> dict | None:
        for p in productos:
            if p.id == producto_id:
                return cls._to_dict(p)
        return None

    # (c) search_by_nombre(query) case-insensitive con .lower()
    @classmethod
    def search_by_nombre(cls, query: str) -> list[dict]:
        query_lower = query.lower()
        resultados = [
            cls._to_dict(p) for p in productos 
            if query_lower in p.nombre.lower()
        ]
        return resultados

    # (d) ensure_categoria(categoria_id) que valida existencia
    @classmethod
    def ensure_categoria(cls, categoria_id: int) -> tuple[bool, str]:
        cat = cls._find_categoria(categoria_id)
        if not cat:
            return False, f"La categoria {categoria_id} no existe"
        return True, ""

    # (e) create(), update() usando model_dump(exclude_unset=True) y delete()
    @classmethod
    def create(cls, data: ProductoCreate) -> dict:
        new_id = bump_producto_id()
        nuevo_producto = Producto(
            id=new_id,
            nombre=data.nombre,
            precio=data.precio,
            stock=data.stock,
            categoria_id=data.categoria_id,
            activo=data.activo
        )
        productos.append(nuevo_producto)
        return cls._to_dict(nuevo_producto)

    @classmethod
    def update(cls, producto_id: int, data: ProductoUpdate) -> dict | None:
        # Buscamos el objeto Producto crudo en la lista global para modificarlo
        p_obj = None
        for p in productos:
            if p.id == producto_id:
                p_obj = p
                break
        
        if not p_obj:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(p_obj, key, value)
            
        return cls._to_dict(p_obj)

    @staticmethod
    def delete(producto_id: int) -> bool:
        for p in productos:
            if p.id == producto_id:
                productos.remove(p)
                return True
        return False