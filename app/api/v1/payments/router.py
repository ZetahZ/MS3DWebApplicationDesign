import os
import mercadopago
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/payments", tags=["Pagos"])

# Coloca aquí tu Access Token de prueba de Mercado Pago (ej: TEST-...)
# O asegúrate de tenerlo configurado en tus variables de entorno
ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN", "TU_ACCESS_TOKEN_DE_MERCADOPAGO_AQUI")
SDK = mercadopago.SDK(ACCESS_TOKEN)

class ItemSchema(BaseModel):
    title: str
    quantity: int
    unit_price: float

class CheckoutSchema(BaseModel):
    items: List[ItemSchema]
    shipping_cost: float = 0.0
    payer_email: str

@router.post("/create-preference")
def create_preference(data: CheckoutSchema):
    try:
        items = [
            {
                "title": item.title,
                "quantity": int(item.quantity),
                "unit_price": float(item.unit_price),
                "currency_id": "ARS",
            }
            for item in data.items
        ]
        
        if data.shipping_cost > 0:
            items.append({
                "title": "Costo de Envío",
                "quantity": 1,
                "unit_price": float(data.shipping_cost),
                "currency_id": "ARS",
            })

        preference_data = {
            "items": items,
            "payer": {
                "email": data.payer_email or "test_user@test.com",
            },
            "back_urls": {
                "success": "http://localhost:5173/?status=success",
                "failure": "http://localhost:5173/?status=failure",
                "pending": "http://localhost:5173/?status=pending",
            },
            "auto_return": "approved",
        }

        # Creamos la preferencia en Mercado Pago
        preference_response = SDK.preference().create(preference_data)
        
        # Imprimimos en la terminal de FastAPI la respuesta completa para debuguear si vuelve a fallar
        print("Respuesta de Mercado Pago:", preference_response)

        # Verificamos si la respuesta contiene el diccionario "response"
        if not preference_response or "response" not in preference_response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Mercado Pago no devolvió una respuesta válida. Revisa tu Access Token."
            )

        preference = preference_response["response"]
        
        # Obtenemos el link de pago de forma segura
        init_point = preference.get("init_point") or preference.get("sandbox_init_point")

        if not init_point:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo obtener el link de pago de Mercado Pago."
            )

        return {
            "preference_id": preference.get("id"),
            "init_point": init_point,
        }

    except Exception as e:
        print(f"Error detallado en pagos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar pago en Mercado Pago: {str(e)}"
        )