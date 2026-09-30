from fastapi import APIRouter, HTTPException, status, Query
from app.api.v1.productos.schemas import ProductoCreate, ProductoUpdate, ProductoResponse
from app.api.v1.productos.repository import ProductoRepository

# (a) router = APIRouter con prefix y tags
router = APIRouter(prefix="/productos", tags=["Productos"])

# (b) GET /productos con query params opcionales combinables: ?query= y ?categoria_id=
@router.get("/", response_model=list[ProductoResponse])
def listar_productos(
    query: str | None = Query(None, description="Buscar por nombre de manera parcial"),
    categoria_id: int | None = Query(None, description="Filtrar por ID de categoría")
):
    # Si hay query de texto, usamos la búsqueda case-insensitive del repositorio
    if query:
        productos = ProductoRepository.search_by_nombre(query)
    else:
        productos = ProductoRepository.list_productos()
    
    # Si además se pasa categoria_id, filtramos el resultado combinándolo
    if categoria_id is not None:
        productos = [p for p in productos if p["categoria"]["id"] == categoria_id]
        
    return productos

# (c) GET /productos/{id} — devuelve 404 si no existe
@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int):
    producto = ProductoRepository.get_by_id(producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con id {producto_id} no fue encontrado"
        )
    return producto

# (d) POST /productos — status 201, valida ensure_categoria y retorna 400 si falla
@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate):
    valido, mensaje = ProductoRepository.ensure_categoria(data.categoria_id)
    if not valido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=mensaje
        )
    
    nuevo_producto = ProductoRepository.create(data)
    return nuevo_producto

# (e) PUT /productos/{id} — status 200, valida categoría si se modifica
@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(producto_id: int, data: ProductoUpdate):
    # Verificamos primero si el producto existe
    producto_existente = ProductoRepository.get_by_id(producto_id)
    if not producto_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con id {producto_id} no fue encontrado"
        )
    
    # Si se envía un nuevo categoria_id en el PUT parcial, revalidamos que exista
    update_data = data.model_dump(exclude_unset=True)
    if "categoria_id" in update_data:
        valido, mensaje = ProductoRepository.ensure_categoria(update_data["categoria_id"])
        if not valido:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=mensaje
            )
            
    producto_actualizado = ProductoRepository.update(producto_id, data)
    return producto_actualizado

# (f) DELETE /productos/{id} — status 204 (o 404 si no existe)
@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int):
    eliminado = ProductoRepository.delete(producto_id)
    if not eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con id {producto_id} no fue encontrado"
        )
    return None