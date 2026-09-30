from fastapi import FastAPI
from app.api.v1.productos.router import router as productos_router
from app.api.v1.categorias.router import router as categorias_router

app = FastAPI(
    title="MS 3D API",
    version="1.0",
    description="API modular para la gestión de productos y categorías de MS 3D"
)

# Registramos las rutas de la API modular
app.include_router(productos_router, prefix="/api/v1/productos", tags=["productos"])
app.include_router(categorias_router, prefix="/api/v1/categorias", tags=["categorias"])

@app.get("/")
def read_root():
    return {"message": "¡Bienvenido a la API de MS 3D funcionando al 100%!"}