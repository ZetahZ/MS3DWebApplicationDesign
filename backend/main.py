from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models
from database import engine, get_db

# Crea las tablas en la base de datos automáticamente si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MS 3D API", version="1.0")

@app.get("/")
def read_root():
    return {"message": "¡Bienvenido a la API de MS 3D funcionando con PostgreSQL 16!"}

@app.get("/products/")
def get_products(db: Session = Depends(get_db)):
    # Aquí consultaremos los productos de la base de datos más adelante
    return {"status": "Conexión exitosa a la base de datos"}