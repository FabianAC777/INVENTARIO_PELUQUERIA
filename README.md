# Inventario de peluquería

Aplicación MVC para registrar y consultar insumos, controlar stock crítico y descontar una unidad de manera atómica. Usa Node.js, Express y Supabase.

## Requisitos

- Node.js 18 o superior
- Un proyecto Supabase

## Configuración

1. Instala dependencias con `npm install`.
2. Completa el `.env` local con `PORT`, `SUPABASE_URL` y `SUPABASE_KEY`. No subas ese archivo a GitHub.
3. En Supabase, abre **SQL Editor**, pega y ejecuta `database/schema.sql`.
4. Inicia el servidor con `npm start` y abre `http://localhost:3000`.

Usa una clave publishable (o la antigua clave `anon`) en `SUPABASE_KEY`. Nunca pongas una clave `service_role` o `secret` en esta aplicación.

## Estructura MVC

- `public/`: interfaz, estilos responsivos y lógica del navegador.
- `src/routes/`: rutas HTTP.
- `src/controllers/`: validación y operaciones de inventario.
- `src/config/`: cliente Supabase del backend.
- `database/schema.sql`: tablas, políticas RLS, permisos, categorías iniciales y función SQL.

El descuento se expone como una función PostgreSQL (`descontar_stock`) para poder invocarlo mediante la API RPC de Supabase; el cambio de stock se realiza en una sola operación atómica.

## API

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/insumos` | Lista insumos con sus categorías |
| `GET` | `/api/categorias` | Lista categorías disponibles |
| `POST` | `/api/insumos` | Registra un insumo |
| `PUT` | `/api/insumos/:id/descontar` | Descuenta una unidad usando una función SQL atómica |
| `DELETE` | `/api/insumos/:id` | Elimina un insumo |

El `schema.sql` permite acceso de inventario a la clave `anon` para que esta aplicación de ejemplo funcione sin autenticación. Por ello, cualquier persona que alcance el servidor puede modificar el inventario. Antes de publicar la app, incorpora autenticación y restringe las políticas RLS a los usuarios autorizados.
