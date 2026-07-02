# ðŸŽ™ï¸ Ejercicio T8: PodcastHub API

## La Plataforma de Podcasts que lo Peta

Crea una API completa con autenticaciÃ³n JWT, autorizaciÃ³n por roles, documentaciÃ³n Swagger y tests automatizados.

**Nivel:** â­â­â­â­ Experto | **Tiempo:** 50-60 min | **Temas:** T7 + T8

---

## ðŸ“– Historia

Una startup de podcasts te ficha como backend developer. Tienen 3 meses de runway, el CTO estÃ¡ en modo pÃ¡nico y necesitan una API en producciÃ³n ya. El sistema debe tener autenticaciÃ³n segura (ya quemaron datos de usuarios en producciÃ³n una vez), documentaciÃ³n para el equipo de frontend, y tests porque el CEO leyÃ³ en Twitter que los tests son importantes.

Tu misiÃ³n: entregar `PodcastHub API v1.0` antes del lunes o el proyecto muere.

---

## ðŸ“‹ Requisitos

### Estructura del proyecto

```
src/
â”œâ”€â”€ app.js
â”œâ”€â”€ index.js
â”œâ”€â”€ config/
â”‚   â””â”€â”€ db.js
â”œâ”€â”€ controllers/
â”‚   â”œâ”€â”€ auth.controller.js
â”‚   â””â”€â”€ podcasts.controller.js
â”œâ”€â”€ docs/
â”‚   â””â”€â”€ swagger.js
â”œâ”€â”€ middleware/
â”‚   â”œâ”€â”€ session.middleware.js   # Verifica JWT
â”‚   â””â”€â”€ rol.middleware.js       # Verifica rol
â”œâ”€â”€ models/
â”‚   â”œâ”€â”€ user.model.js
â”‚   â””â”€â”€ podcast.model.js
â”œâ”€â”€ routes/
â”‚   â”œâ”€â”€ index.js
â”‚   â”œâ”€â”€ auth.routes.js
â”‚   â””â”€â”€ podcasts.routes.js
â””â”€â”€ validators/
    â”œâ”€â”€ auth.validator.js
    â””â”€â”€ podcast.validator.js
tests/
â”œâ”€â”€ auth.test.js
â””â”€â”€ podcasts.test.js
```

---

### Modelo User

```javascript
{
  name: String,            // Requerido, mÃ­n 2 chars
  email: String,           // Requerido, Ãºnico, formato email
  password: String,        // Requerido, mÃ­n 8 chars (guardar hasheado)
  role: String,            // Enum: ['user', 'admin'], default: 'user'
  createdAt: Date          // timestamps: true
}
```

### Modelo Podcast

```javascript
{
  title: String,           // Requerido, mÃ­n 3 chars
  description: String,     // Requerido, mÃ­n 10 chars
  author: ObjectId,        // Ref a User, requerido
  category: String,        // Enum: ['tech', 'science', 'history', 'comedy', 'news']
  duration: Number,        // DuraciÃ³n en segundos, mÃ­n 60
  episodes: Number,        // NÃºmero de episodios, default: 1
  published: Boolean,      // Si estÃ¡ publicado, default: false
  createdAt: Date          // timestamps: true
}
```

---

### Endpoints

#### Auth

| MÃ©todo | Ruta | Acceso | DescripciÃ³n |
|--------|------|--------|-------------|
| POST | /api/auth/register | PÃºblico | Registro de usuario |
| POST | /api/auth/login | PÃºblico | Login, devuelve token |
| GET | /api/auth/me | Autenticado | Perfil del usuario actual |

#### Podcasts

| MÃ©todo | Ruta | Acceso | DescripciÃ³n |
|--------|------|--------|-------------|
| GET | /api/podcasts | PÃºblico | Listar podcasts publicados |
| GET | /api/podcasts/:id | PÃºblico | Obtener un podcast |
| POST | /api/podcasts | Autenticado | Crear podcast |
| PUT | /api/podcasts/:id | Autenticado (autor) | Actualizar propio podcast |
| DELETE | /api/podcasts/:id | Admin | Eliminar cualquier podcast |
| GET | /api/podcasts/admin/all | Admin | Listar todos (incluye no publicados) |
| PATCH | /api/podcasts/:id/publish | Admin | Publicar/despublicar |

---

### AutenticaciÃ³n JWT

Implementar el flujo completo de T7:

1. **Registro**: Hashear contraseÃ±a con `bcryptjs` (10 rounds) antes de guardar
2. **Login**: Verificar credenciales y generar JWT

El token JWT **debe incluir Ãºnicamente en el payload**:
```javascript
{ userId: user._id }
```

> El token NO debe incluir datos como `role` o `email`. Esos datos se obtienen siempre consultando la base de datos a partir del `userId`.

3. **Middleware de sesiÃ³n** (`session.middleware.js`):
   - Leer el token del header `Authorization: Bearer <token>`
   - Verificar con `jwt.verify()`
   - Buscar el usuario en BD con `User.findById(decoded.userId)`
   - Asignar a `req.user` el documento completo del usuario
   - Devolver 401 si no hay token, es invÃ¡lido o el usuario no existe

4. **Middleware de rol** (`rol.middleware.js`):
   - FunciÃ³n factory que acepta un rol como parÃ¡metro
   - Verifica que `req.user.role === rolRequerido`
   - Devuelve 403 si no tiene permiso

---

### DocumentaciÃ³n Swagger

Documentar **todos los endpoints** con `swagger-jsdoc` y `swagger-ui-express`.

**ConfiguraciÃ³n base** en `src/docs/swagger.js`:

```javascript
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PodcastHub API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        BearerToken: {               // <-- Nombre del esquema
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    }
  },
  apis: ['./src/routes/*.js'],
};
```

En cada ruta protegida aÃ±adir en el JSDoc:
```yaml
security:
  - bearerAuth: []
```

**Schemas requeridos** en Swagger:
- `User` (sin campo `password` en respuestas)
- `Podcast`
- `AuthResponse` (token + user)
- `Error` (message)

Swagger debe estar disponible en `GET /api-docs`.

---

### Tests con Jest + Supertest

Crear tests en `tests/auth.test.js` y `tests/podcasts.test.js`.

**ConfiguraciÃ³n** `jest.config.js`:
```javascript
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
};
```

#### `tests/auth.test.js` â€” Tests requeridos:

```
âœ“ POST /api/auth/register â†’ 201 con usuario creado
âœ“ POST /api/auth/register â†’ 400 si email duplicado
âœ“ POST /api/auth/register â†’ 400 si faltan campos
âœ“ POST /api/auth/login â†’ 201 con token cuando credenciales vÃ¡lidas
âœ“ POST /api/auth/login â†’ 401 si contraseÃ±a incorrecta
âœ“ GET  /api/auth/me â†’ 200 con datos del usuario (requiere token)
âœ“ GET  /api/auth/me â†’ 401 sin token
```

#### `tests/podcasts.test.js` â€” Tests requeridos:

```
âœ“ GET  /api/podcasts â†’ 200 con array (solo publicados)
âœ“ POST /api/podcasts â†’ 201 con podcast creado (requiere token)
âœ“ POST /api/podcasts â†’ 401 sin token
âœ“ DELETE /api/podcasts/:id â†’ 200 solo para admin
âœ“ DELETE /api/podcasts/:id â†’ 403 para user normal
âœ“ GET  /api/podcasts/admin/all â†’ 200 solo para admin
```

> **Importante**: Los tests deben conectarse a una base de datos de test separada. AÃ±ade en `.env`:
> ```
> MONGODB_TEST_URI=mongodb+srv://...tu-db-de-test...
> ```
> Y en los tests usa siempre `process.env.MONGODB_TEST_URI` para la conexiÃ³n. Para simplificar, reutiliza la misma URI de desarrollo pero apunta a una base de datos con sufijo `_test`.

---

### Variables de entorno

```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster/podcasthub
MONGODB_TEST_URI=mongodb+srv://user:pass@cluster/podcasthub_test
JWT_SECRET=supersecretkey_min32chars_requerido
JWT_EXPIRES_IN=2h
```

---

## ðŸŽ¯ Criterios de Ã©xito

- [ ] Registro y login funcionan, se devuelve token JWT
- [ ] Rutas protegidas requieren `Authorization: Bearer <token>`
- [ ] Solo admins pueden borrar podcasts y ver no publicados
- [ ] Swagger accesible en `/api-docs` con todos los endpoints documentados
- [ ] BotÃ³n "Authorize" de Swagger permite probar rutas protegidas
- [ ] `npm test` pasa todos los tests sin errores
- [ ] Tests de auth y podcasts cubren casos de Ã©xito y error

## ðŸŽ BONUS

1. Implementar `PATCH /api/auth/change-password` (requiere contraseÃ±a actual)
2. AÃ±adir paginaciÃ³n a `GET /api/podcasts` (`?page=1&limit=10`)
3. Test de cobertura `npm run test:coverage` > 80%
4. Webhook a Slack cuando se registra un nuevo admin

---

## ðŸš€ Ejecutar

```bash
cd ejercicios/T8
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev

# Tests
npm test
```

