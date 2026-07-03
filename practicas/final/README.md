# Práctica final — BildyApp

API completa para digitalizar albaranes, construida con Node.js 22, Express 5,
MongoDB y Socket.IO.

## Funcionalidad

- Onboarding, autenticación JWT, refresh tokens, roles y compañías.
- Clientes y proyectos compartidos por compañía, con filtros, paginación,
  archivo y restauración.
- Albaranes de materiales u horas, generación PDF y firma optimizada con Sharp.
- Almacenamiento en Cloudinary, email SMTP y errores 5XX enviados a Slack.
- Eventos Socket.IO aislados por compañía.
- OpenAPI/Swagger en `/api-docs`.
- Seguridad con Helmet, rate limiting, Zod y sanitización.
- Tests con Jest, Supertest y MongoDB en memoria.
- Docker multi-stage, Compose, health check, graceful shutdown y GitHub Actions.

## Ejecución local

1. Copia `.env.example` a `.env` y completa las credenciales.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev`.
4. Abre Swagger en `http://localhost:3000/api-docs`.

## Tests

```bash
npm test
npm run test:coverage
```

## Docker

```bash
docker compose up --build
```

Las credenciales reales no deben incluirse nunca en Git.
