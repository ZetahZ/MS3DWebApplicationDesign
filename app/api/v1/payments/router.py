import os
import mercadopago
from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import List
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from sqlalchemy.orm import Session

# Importaciones correctas basadas en la estructura de tu proyecto
from app.core.db import get_db
from app.models.order import OrderModel

router = APIRouter(prefix="/payments", tags=["Pagos"])

# ------------------------------------------------------------------
# 1. Configuración de Mercado Pago
# ------------------------------------------------------------------
ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN", "APP_USR-1992342808143869-102622-8b66737d79333102e704b6e097d73d15-3796774408")
SDK = mercadopago.SDK(ACCESS_TOKEN)

# ------------------------------------------------------------------
# 2. Configuración de Email (SMTP de Gmail para M's3D)
# ------------------------------------------------------------------
mail_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "zetahz03d@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "ojxeorvhodydxvqd"),  
    MAIL_FROM=os.getenv("MAIL_FROM", "zetahz03d@gmail.com"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_order_confirmation_email(email_to: str, order_data: dict):
    """Función asíncrona para armar y enviar el correo de confirmación."""
    try:
        items_html = "".join([
            f"<li style='margin-bottom: 5px;'><strong>{item['title']}</strong> (x{item['quantity']}) — ${item['unit_price']:,.2f}</li>"
            for item in order_data["items"]
        ])

        html_content = f"""
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #00bcd4; text-align: center; margin-top: 0;">M's3D Print Studio</h2>
            <h3 style="color: #0f172a;">¡Gracias por tu compra, {order_data['full_name']}! 🎉</h3>
            <p>Hemos recibido tus datos con éxito. A continuación te mostramos el resumen de tu pedido:</p>
            
            <h4 style="border-bottom: 2px solid #00bcd4; padding-bottom: 6px;">Detalle del pedido:</h4>
            <ul style="padding-left: 20px;">
                {items_html}
            </ul>
            <p style="font-size: 16px;"><strong>Total:</strong> ${order_data['total_amount']:,.2f}</p>
            
            <h4 style="border-bottom: 2px solid #00bcd4; padding-bottom: 6px;">Datos de envío:</h4>
            <p style="line-height: 1.6;">
                <strong>Dirección:</strong> {order_data['address']}<br>
                <strong>Ciudad / Provincia:</strong> {order_data['city']}, {order_data['province']}<br>
                <strong>Teléfono de contacto:</strong> {order_data['phone']}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b; text-align: center;">Si tienes alguna duda sobre tu pedido, puedes responder directamente a este correo.</p>
        </div>
        """

        message = MessageSchema(
            subject="Confirmación de Pedido - M's3D",
            recipients=[email_to],
            body=html_content,
            subtype=MessageType.html
        )

        fm = FastMail(mail_config)
        await fm.send_message(message)
        print(f"Correo de confirmación enviado exitosamente a: {email_to}")
    except Exception as e:
        print(f"Error al enviar el correo a {email_to}: {str(e)}")

# ------------------------------------------------------------------
# 3. Esquemas de Datos (Pydantic)
# ------------------------------------------------------------------
class ItemSchema(BaseModel):
    title: str
    quantity: int
    unit_price: float

class FullCheckoutSchema(BaseModel):
    full_name: str
    phone: str
    email: str
    address: str
    city: str
    province: str
    items: List[ItemSchema]
    shipping_cost: float = 0.0

# ------------------------------------------------------------------
# 4. Endpoint Principal de Pago, Base de Datos y Correo
# ------------------------------------------------------------------
@router.post("/create-preference")
async def create_preference(
    data: FullCheckoutSchema, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
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
                "name": data.full_name,
                "email": data.email or "test_user@test.com",
                "phone": {
                    "number": data.phone
                }
            }
        }

        preference_response = SDK.preference().create(preference_data)
        print("Respuesta de Mercado Pago:", preference_response)

        if not preference_response or "response" not in preference_response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Mercado Pago no devolvió una respuesta válida. Revisa tu Access Token."
            )

        preference = preference_response["response"]
        init_point = preference.get("init_point") or preference.get("sandbox_init_point")

        if not init_point:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo obtener el link de pago de Mercado Pago."
            )

        total_items = sum(item.unit_price * item.quantity for item in data.items)
        grand_total = total_items + data.shipping_cost

        # Guardar en la base de datos (Supabase / PostgreSQL)
        new_order = OrderModel(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            address=data.address,
            city=data.city,
            province=data.province,
            total_amount=grand_total,
            items=[item.dict() for item in data.items],
            status="pendiente"
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        print(f"Pedido guardado en base de datos con ID: {new_order.id}")

        order_summary = {
            "full_name": data.full_name,
            "phone": data.phone,
            "address": data.address,
            "city": data.city,
            "province": data.province,
            "items": [item.dict() for item in data.items],
            "total_amount": grand_total
        }
        background_tasks.add_task(send_order_confirmation_email, data.email, order_summary)

        return {
            "order_id": new_order.id,
            "preference_id": preference.get("id"),
            "init_point": init_point,
            "message": "Pedido guardado, preferencia generada y correo en cola de envío."
        }

    except Exception as e:
        db.rollback()
        print(f"Error detallado en pagos y persistencia: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar el pedido: {str(e)}"
        )