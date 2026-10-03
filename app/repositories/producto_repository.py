from sqlalchemy.orm import Session
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate

class ProductoRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(Producto).all()

    @staticmethod
    def get_by_id(db: Session, producto_id: int):
        return db.query(Producto).filter(Producto.id == producto_id).first()

    @staticmethod
    def create(db: Session, data: ProductoCreate):
        nuevo_producto = Producto(**data.model_dump())
        db.add(nuevo_producto)
        db.commit()
        db.refresh(nuevo_producto)
        return nuevo_producto

    @staticmethod
    def update(db: Session, producto_id: int, data: ProductoUpdate):
        producto = db.query(Producto).filter(Producto.id == producto_id).first()
        if not producto:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(producto, key, value)
            
        db.commit()
        db.refresh(producto)
        return producto

    @staticmethod
    def delete(db: Session, producto_id: int):
        producto = db.query(Producto).filter(Producto.id == producto_id).first()
        if not producto:
            return False
        db.delete(producto)
        db.commit()
        return True