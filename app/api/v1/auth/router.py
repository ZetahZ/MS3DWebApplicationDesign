import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.db import get_db
from app.core.email import enviar_codigo_verificacion, enviar_codigo_reset
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

class VerifySchema(BaseModel):
    email: EmailStr
    codigo: str

class ForgotSchema(BaseModel):
    email: EmailStr

class ResetSchema(BaseModel):
    email: EmailStr
    codigo: str
    nueva_password: str


def generar_codigo() -> str:
    return f"{random.randint(0, 999999):06d}"


@router.post("/register")
def register_user(user_data: RegisterSchema, db: Session = Depends(get_db)):
    codigo = generar_codigo()
    existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()

    if existing_user and existing_user.verificado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )

    if existing_user:
        # Se registró pero nunca verificó: nuevo código y reenvío
        existing_user.codigo_verificacion = codigo
        existing_user.nombre = user_data.nombre
        existing_user.password = user_data.password
        db.commit()
        nombre = existing_user.nombre
    else:
        nuevo_usuario = Usuario(
            nombre=user_data.nombre,
            email=user_data.email,
            password=user_data.password,
            verificado=False,
            codigo_verificacion=codigo,
        )
        db.add(nuevo_usuario)
        db.commit()
        nombre = nuevo_usuario.nombre

    if not enviar_codigo_verificacion(user_data.email, codigo, nombre or ""):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo enviar el correo de verificación. Intenta registrarte de nuevo."
        )

    return {
        "message": "Te enviamos un código de verificación a tu correo. Ingresalo para activar tu cuenta."
    }


@router.post("/verify")
def verify_user(data: VerifySchema, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe una cuenta con ese correo."
        )
    if user.verificado:
        return {"message": "La cuenta ya estaba verificada. Podés iniciar sesión."}
    if user.codigo_verificacion != data.codigo.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código es incorrecto."
        )

    user.verificado = True
    user.codigo_verificacion = None
    db.commit()

    return {"message": "Correo verificado. Ya podés iniciar sesión."}


@router.post("/forgot")
def forgot_password(data: ForgotSchema, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()

    if user:
        codigo = generar_codigo()
        user.codigo_verificacion = codigo
        db.commit()
        enviar_codigo_reset(user.email, codigo, user.nombre or "")

    # Misma respuesta exista o no el correo: así no se puede averiguar
    # qué mails están registrados probando.
    return {
        "message": "Si el correo está registrado, te llegó un código para cambiar la contraseña."
    }


@router.post("/reset-password")
def reset_password(data: ResetSchema, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()

    if (
        not user
        or not user.codigo_verificacion
        or user.codigo_verificacion != data.codigo.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código es incorrecto."
        )

    user.password = data.nueva_password
    user.codigo_verificacion = None
    db.commit()

    return {"message": "Contraseña actualizada. Ya podés iniciar sesión."}


@router.post("/login")
def login_user(credentials: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == credentials.email).first()

    if not user or user.password != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correo electrónico o contraseña incorrectos."
        )

    if not user.verificado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenés que verificar tu correo primero. Revisá tu casilla: te enviamos un código."
        )

    return {
        "message": "Inicio de sesión exitoso",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email
        }
    }
