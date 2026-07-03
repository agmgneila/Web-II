# T9 — Biblioteca con Supabase y Prisma

API REST con PostgreSQL/Supabase, Prisma, JWT y control de roles.

## Puesta en marcha

1. Copia `.env.example` a `.env` y completa `DATABASE_URL` y `JWT_SECRET`.
2. Instala dependencias con `npm install`.
3. Ejecuta `npm run db:generate`.
4. Aplica la migración con `npm run db:migrate`.
5. Inicia la API con `npm run dev`.

La conexión recomendada para equipos IPv4 es el **Session pooler** de Supabase
en el puerto `5432`.

## Funcionalidad

- Registro, login y perfil autenticado.
- CRUD de libros con filtros y paginación.
- Roles `USER`, `LIBRARIAN` y `ADMIN`.
- Máximo de tres préstamos activos, control de duplicados e inventario
  transaccional.
- Devoluciones y reseñas únicamente tras haber leído el libro.
- Manejo centralizado de errores de Prisma.

El archivo `tests/api.http` contiene peticiones de ejemplo.
