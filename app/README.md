# API de Gestión de Productos y Categorías - FastAPI

Trabajo práctico desarrollado con una arquitectura modular por capas, utilizando **FastAPI** para la creación de la API, **Pydantic** para la validación de datos y el **Patrón Repository** para separar la lógica de negocio y persistencia.

---

## Estructura del Proyecto

```text
tp-productos-api/
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── categorias/
│   │       └── productos/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   └── main.py
│
├── .gitignore
├── README.md
└── requirements.txt
```
# para levantar la api en la terminal ejecutar estos 2 codigos
fastapi dev app/main.py
venv\Scripts\Activate.ps1
