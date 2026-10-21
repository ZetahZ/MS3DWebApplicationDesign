from sqlalchemy import Column, Integer, String
from app.core.db import Base  # o la clase Base que usen en core/db.py

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)