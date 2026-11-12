import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.db import get_db
# Comentamos temporalmente las importaciones de correo si no se usan
# from app.core.email import enviar_codigo_verificacion, enviar_codigo_reset
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
        existing_user.codigo_verificacion = codigo
        existing_user.nombre = user_data.nombre
        existing_user.password = user_data.password
        existing_user.verificado = True  # Auto-verificado para pruebas sin correo
        db.commit()
        nombre = existing_user.nombre
    else:
        nuevo_usuario = Usuario(
            nombre=user_data.nombre,
            email=user_data.email,
            password=user_data.password,
            verificado=True,  # <--- MARCADO COMO VERIFICADO PARA QUE PUEDAS ENTRAR DIRECTO
            codigo_verificacion=codigo,
        )
        db.add(nuevo_usuario)
        db.commit()
        nombre = nuevo_usuario.nombre

    # --- CORREO DESACTIVADO TEMPORALMENTE ---
    # if not enviar_codigo_verificacion(user_data.email, codigo, nombre or ""):
    #     raise HTTPException(
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         detail="No se pudo enviar el correo de verificación. Intenta registrarte de nuevo."
    #     )

    return {
        "message": "Registro exitoso (Modo pruebas: cuenta auto-verificada)."
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
        # enviar_codigo_reset(user.email, codigo, user.nombre or "")

    return {
        "message": "Si el correo está registrado, simulación de recuperación completada."
    }


@router.post("/reset-password")
def reset_password(data: ResetSchema, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no encontrado."
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
            detail="Tenés que verificar tu correo primero."
        )

    return {
        "message": "Inicio de sesión exitoso",
        "id": user.id,
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "is_admin": user.is_admin
        }
    }