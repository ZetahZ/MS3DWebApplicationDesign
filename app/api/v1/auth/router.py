from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

# Ajustamos las importaciones según la arquitectura del proyecto
from app.core.db import get_db
# Importamos el modelo de usuario (asegúrate de tener definido Usuario en app/models/usuario.py o en tu models)
from app.models.usuario import Usuario  

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)

# Esquemas de Pydantic
class RegisterSchema(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register_user(user_data: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )

    nuevo_usuario = Usuario(
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


@router.post("/login")
def login_user(credentials: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == credentials.email).first()

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