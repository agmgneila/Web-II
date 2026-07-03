# Práctica intermedia — BildyApp

API de usuarios y compañías con Express 5, MongoDB, Mongoose, Zod y JWT.

## Incluye

- Registro, verificación de email, login, access token y refresh token revocable.
- Onboarding personal, compañía compartida por CIF y autónomos.
- Roles `admin` y `guest`, invitaciones y eventos de ciclo de vida.
- Logo con Multer, `populate`, virtual `fullName` e índices.
- Cambio de contraseña y borrado lógico o físico.
- Helmet, rate limiting, sanitización y errores centralizados.

## Ejecución

1. Copia `.env.example` a `.env` y completa sus valores.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev`.

Las peticiones de ejemplo están en `requests.http`.
