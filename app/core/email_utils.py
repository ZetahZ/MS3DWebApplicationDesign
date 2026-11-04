from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
import os

conf = ConnectionConfig(
    MAIL_USERNAME="zetahz03d@gmail.com",
    MAIL_PASSWORD="ojxeorvhodydxvqd",  # Contraseña de 16 letras todo junto y sin espacios
    MAIL_FROM="zetahz03d@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_order_confirmation_email(email_to: EmailStr, order_data: dict):
    # Generar detalle HTML de los productos
    items_html = "".join([
        f"<li><strong>{item['title']}</strong> (x{item['quantity']}) - ${item['unit_price']:,.2f}</li>"
        for item in order_data["items"]
    ])

    html_content = f"""
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #00bcd4; text-align: center;">M's3D Print Studio</h2>
        <h3>¡Gracias por tu compra, {order_data['full_name']}! 🎉</h3>
        <p>Hemos recibido tu pedido con éxito y ya lo estamos procesando.</p>
        
        <h4>Detalle del pedido:</h4>
        <ul>
            {items_html}
        </ul>
        <p><strong>Total pagado:</strong> ${order_data['total_amount']:,.2f}</p>
        
        <h4>Datos de envío:</h4>
        <p>
            <strong>Dirección:</strong> {order_data['address']}<br>
            <strong>Ciudad/Provincia:</strong> {order_data['city']}, {order_data['province']}<br>
            <strong>Teléfono:</strong> {order_data['phone']}
        </p>
        
        <hr>
        <p style="font-size: 12px; color: #777; text-align: center;">Si tienes dudas sobre tu pedido, contáctanos respondiendo a este correo.</p>
    </div>
    """

    message = MessageSchema(
        subject="Confirmación de Orden de Compra - M's3D",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)