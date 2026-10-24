from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.db import engine, Base
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.usuario import Usuario  # <-- 1. Importa el modelo de usuario por si acaso
from app.models.encargo import Encargo
from app.api.v1.productos.router import router as productos_router
from app.api.v1.categorias.router import router as categorias_router
from app.api.v1.auth.router import router as auth_router  # <-- 2. IMPORTA EL ROUTER DE AUTH
from app.api.v1.encargos.router import router as encargos_router

# Crea las tablas automáticamente en PostgreSQL al iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ZetahZ 3D API",
    version="2.0.0",
    description="API limpia con FastAPI, SQLAlchemy y PostgreSQL"
)

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones desde cualquier origen (ideal para desarrollo con React/Vite)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

# Registrar los endpoints
app.include_router(productos_router, prefix="/api/v1")
app.include_router(categorias_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")  # <-- 3. REGISTRA EL ROUTER DE AUTH
app.include_router(encargos_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "API de ZetahZ 3D funcionando al 100% 🚀"}