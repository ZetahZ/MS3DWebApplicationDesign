import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Lee las credenciales del .env (nunca se suben a GitHub)
load_dotenv()

SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")


def enviar_codigo_verificacion(destino: str, codigo: str, nombre: str = "") -> bool:
    """Envia el codigo de 6 digitos al correo del usuario via Gmail SMTP."""
    if not SMTP_USER or not SMTP_PASSWORD:
        return False

    msg = EmailMessage()
    msg["Subject"] = "Tu codigo de verificacion - M's3D"
    msg["From"] = f"M's3D Print Studio <{SMTP_USER}>"
    msg["To"] = destino
    msg.set_content(
        f"Hola {nombre or 'che'}!\n\n"
        f"Tu codigo de verificacion para M's3D es:\n\n"
        f"        {codigo}\n\n"
        f"Ingresalo en la pagina para activar tu cuenta.\n"
        f"Si no te registraste vos, ignora este correo.\n\n"
        f"- El equipo de M's3D"
    )

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.send_message(msg)
        return True
    except Exception as e:
        print("Error enviando correo:", e)
        return False
