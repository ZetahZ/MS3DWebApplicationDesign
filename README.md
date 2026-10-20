# MS 3D Web Application

Tienda web de impresiones/modelos 3D: catálogo de productos por categorías, detalle de producto, carrito, checkoy panel de pedidos.

## Integrantes 

Mejia Fabrizio : https://github.com/ZetahZ
Gutierrez Jose Maria : https://github.com/Gutierrez-Jose-M
Arapa Dillan Luigi A. : https://github.com/ArapaDillan10

## Stack

| Parte | Tecnología |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| Backend | FastAPI + SQLAlchemy |
| Base de datos | PostgreSQL |

## Estructura del proyecto

```
├── src/            # Frontend (React)
│   ├── pages/      # Páginas (catálogo, carrito, checkout, etc.)
│   ├── components/ # Componentes reutilizables (Header, CartModal...)
│   └── services/   # Llamadas a la API
├── app/            # Backend API (FastAPI, versión actual)
│   ├── api/v1/     # Routers de productos y categorías
│   ├── models/     # Modelos SQLAlchemy (tablas)
│   ├── schemas/    # Schemas Pydantic
│   └── core/db.py  # Conexión a PostgreSQL
├── backend/        # Backend viejo/simple (versión 1.0, mantener o borrar)
├── main.py         # Entry point del backend (app FastAPI)
├── index.html      # Shell del frontend
└── vite.config.ts  # Config de Vite
```

## Requisitos

- **Node.js 22+** — https://nodejs.org (versión LTS)
- **pnpm** — `npm install -g pnpm`
- **Python 3.11+** — https://python.org (marcar "Add Python to PATH" al instalar)
- **PostgreSQL** — para el backend; crear una base llamada `ms3d`

## Levantar el frontend

```bash
pnpm install    
pnpm dev        
```


## Levantar el backend

```bash
pip install fastapi uvicorn "sqlalchemy>=2" psycopg2-binary
uvicorn main:app --reload   
```

### Configurar la base de datos

Cada uno configura su propia conexión con la variable de entorno `DATABASE_URL`
(por defecto apunta a `postgresql://postgres:6363@localhost:5432/ms3d`):

```powershell
$env:DATABASE_URL = "postgresql://postgres:TU_PASSWORD@localhost:5432/ms3d"
```

No commitear credenciales reales — usar siempre la variable de entorno.

## Flujo de trabajo en equipo (Git)

```bash
git pull           
git checkout -b mi-feature        
git add -A
git commit -m "Descripción clara de qué hiciste"
git push -u origin mi-feature    
```

Después abrir un **Pull Request** en GitHub para mergear a `main`, así los demás
revisan el cambio. Para cambios chicos también pueden pushear directo a `main`,
pero siempre con `git pull` antes.
