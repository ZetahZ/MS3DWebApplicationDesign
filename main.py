import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.db import engine, Base
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.usuario import Usuario
from app.models.encargo import Encargo
from app.api.v1.productos.router import router as productos_router
from app.api.v1.categorias.router import router as categorias_router
from app.api.v1.auth.router import router as auth_router
from app.api.v1.encargos.router import router as encargos_router
from app.api.v1.payments.router import router as payments_router
from app.api.v1.admin.router import router as admin_router
from app.api.v1.usuarios.router import router as usuarios_router

# Crea las tablas automáticamente en PostgreSQL al iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ZetahZ 3D API",
    version="2.0.0",
    description="API limpia con FastAPI, SQLAlchemy y PostgreSQL",
)

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar los endpoints
app.include_router(productos_router, prefix="/api/v1")
app.include_router(categorias_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(encargos_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
app.include_router(admin_router)
app.include_router(usuarios_router, prefix="/api/v1")

# Sirve las imágenes subidas desde el panel admin en /static/...
os.makedirs("static/productos", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def root():
    return {"message": "API de ZetahZ 3D funcionando al 100% 🚀"}