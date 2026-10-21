from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexión remota a Supabase (reemplaza TU_CONTRASEÑA por la clave de tu base de datos)
import os

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:dillanesgay6363@db.kumddrxatpazhdqtqjwt.supabase.co:5432/postgres"
)

print("--> CONECTANDO A ESTA BASE DE DATOS:", SQLALCHEMY_DATABASE_URL)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()