from sqlalchemy.orm import Session
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate

class CategoriaRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(Categoria).all()

    @staticmethod
    def get_by_id(db: Session, categoria_id: int):
        return db.query(Categoria).filter(Categoria.id == categoria_id).first()

    @staticmethod
    def create(db: Session, data: CategoriaCreate):
        nueva_categoria = Categoria(**data.model_dump())
        db.add(nueva_categoria)
        db.commit()
        db.refresh(nueva_categoria)
        return nueva_categoria

    @staticmethod
    def delete(db: Session, categoria_id: int):
        categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
        if not categoria:
            return False
        db.delete(categoria)
        db.commit()
        return True