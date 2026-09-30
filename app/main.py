from fastapi import FastAPI
from app.api.v1.productos.router import router as productos_router
from app.api.v1.categorias.router import router as categorias_router

app = FastAPI(
    title="ZetahZ 3D API",
    version="1.0.0",
    description="API para la gestión de productos y categorías del TP"
)

app.include_router(productos_router, prefix="/api/v1")
app.include_router(categorias_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Bienvenido a la API de ZetahZ 3D - FastAPI en funcionamiento"}