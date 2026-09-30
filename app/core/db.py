from app.models.categoria import Categoria
from app.models.producto import Producto

categorias: list[Categoria] = [
    Categoria(id=1, nombre="Electrónica"),
    Categoria(id=2, nombre="Hogar"),
    Categoria(id=3, nombre="Librería")
]

productos: list[Producto] = [
    Producto(id=1, nombre="Auriculares Bluetooth", precio=25000.0, stock=10, categoria_id=1, activo=True),
    Producto(id=2, nombre="Mouse Inalámbrico", precio=12000.0, stock=15, categoria_id=1, activo=True),
    Producto(id=3, nombre="Lámpara de Escritorio", precio=18000.0, stock=8, categoria_id=2, activo=True),
    Producto(id=4, nombre="Organizador de Cajas", precio=9500.0, stock=20, categoria_id=2, activo=True),
    Producto(id=5, nombre="Cuaderno A4 rayado", precio=3500.0, stock=30, categoria_id=3, activo=True),
    Producto(id=6, nombre="Set de Bolígrafos", precio=2000.0, stock=25, categoria_id=3, activo=True)
]

_current_id = len(productos)

def bump_producto_id() -> int:
    global _current_id
    _current_id += 1
    return _current_id