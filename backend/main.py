from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
import models
from app.models import encargo
from database import engine, get_db

# 1. Importar el router de admin desde la carpeta routers
from routers import admin

# Crea las tablas en la base de datos automáticamente si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MS 3D API", version="1.0")

# 2. Registrar el router en la aplicación
app.include_router(admin.router)

# Configuración de CORS para permitir peticiones desde el frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite conexiones desde cualquier origen en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ESQUEMAS PYDANTIC ---
class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class RegisterSchema(BaseModel):
    nombre: str
    email: EmailStr
    password: str


@app.get("/")
def read_root():
    return {"message": "¡Bienvenido a la API de MS 3D funcionando con PostgreSQL 16!"}


@app.get("/products/")
def get_products(db: Session = Depends(get_db)):
    return {"status": "Conexión exitosa a la base de datos"}


# --- ENDPOINT DE REGISTRO ---
@app.post("/api/v1/auth/register")
def register_user(user_data: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(models.Usuario).filter(models.Usuario.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )

    nuevo_usuario = models.Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        password=user_data.password
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {
        "message": "Usuario registrado exitosamente",
        "user": {
            "id": nuevo_usuario.id,
            "nombre": nuevo_usuario.nombre,
            "email": nuevo_usuario.email
        }
    }


# --- ENDPOINT DE LOGIN ---
@app.post("/api/v1/auth/login")
def login_user(credentials: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == credentials.email).first()

    if not user or user.password != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correo electrónico o contraseña incorrectos."
        )

    return {
        "message": "Inicio de sesión exitoso",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email
        }
    }