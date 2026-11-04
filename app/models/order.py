from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from datetime import datetime
from app.core.db import Base

class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    province = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="pendiente")  # pendiente, pagado, enviado
    items = Column(JSON, nullable=False)  # Lista de productos comprados
    created_at = Column(DateTime, default=datetime.utcnow)