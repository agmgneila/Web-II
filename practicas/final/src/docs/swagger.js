import swaggerJsdoc from 'swagger-jsdoc';

const bearer = [{ BearerToken: [] }];
const op = (summary, body = false) => ({
  summary,
  security: bearer,
  ...(body && { requestBody: { required: true, content: {
    'application/json': { schema: { type: 'object' } }
  } } }),
  responses: {
    200: { description: 'Operación correcta' },
    201: { description: 'Recurso creado' },
    400: { description: 'Petición incorrecta' },
    401: { description: 'No autorizado' },
    404: { description: 'No encontrado' }
  }
});
const crud = (label) => ({
  get: op(`Listar ${label}`),
  post: op(`Crear ${label}`, true)
});
const item = (label) => ({
  get: op(`Obtener ${label}`),
  put: op(`Actualizar ${label}`, true),
  delete: op(`Eliminar o archivar ${label}`)
});
const jsonBody = (schema, example) => ({
  required: true,
  content: { 'application/json': { schema, example } }
});
const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Identificador del recurso',
  schema: { type: 'string' }
};
const fileBody = (field, description) => ({
  required: true,
  content: {
    'multipart/form-data': {
      schema: {
        type: 'object',
        required: [field],
        properties: {
          [field]: { type: 'string', format: 'binary', description }
        }
      }
    }
  }
});
const documentedPaths = (paths) => {
  const result = Object.fromEntries(
    Object.entries(paths).map(([path, pathItem]) => [
      path,
      path.includes('{id}') ? { parameters: [idParameter], ...pathItem } : pathItem
    ])
  );

  result['/api/user/logo'].patch.requestBody =
    fileBody('logo', 'Imagen del logotipo');
  result['/api/deliverynote/{id}/sign'].patch.requestBody =
    fileBody('signature', 'Imagen de la firma');

  const pdfOperation = result['/api/deliverynote/pdf/{id}'].get;
  pdfOperation.responses[200] = {
    description: 'PDF del albarán',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } }
    }
  };

  return result;
};

export default swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'BildyApp API', version: '1.0.0' },
    components: {
      securitySchemes: { BearerToken: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: Object.fromEntries(['User', 'Company', 'Client', 'Project', 'DeliveryNote']
        .map((name) => [name, { type: 'object', properties: { _id: { type: 'string' } } }]))
    },
    paths: documentedPaths({
      '/api/user/register': {
        post: {
          ...op('1. Registrar usuario', true),
          security: [],
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 }
              }
            },
            { email: 'demo@example.com', password: 'Password123!' }
          )
        },
        put: {
          ...op('3. Completar datos personales (requiere token)', true),
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['name', 'lastName', 'nif'],
              properties: {
                name: { type: 'string' },
                lastName: { type: 'string' },
                nif: { type: 'string' }
              }
            },
            { name: 'Demo', lastName: 'Usuario', nif: '00000000T' }
          )
        }
      },
      '/api/user/validation': {
        put: {
          ...op('2. Validar email (requiere token)', true),
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['code'],
              properties: { code: { type: 'string', pattern: '^\\d{6}$' } }
            },
            { code: '123456' }
          )
        }
      },
      '/api/user/login': { post: { ...op('Iniciar sesión', true), security: [] } },
      '/api/user/company': { patch: op('Onboarding de compañía', true) },
      '/api/user/logo': { patch: op('Subir logo') },
      '/api/user': { get: op('Obtener perfil'), delete: op('Eliminar usuario') },
      '/api/user/refresh': { post: { ...op('Renovar token', true), security: [] } },
      '/api/user/logout': { post: op('Cerrar sesión') },
      '/api/user/password': { put: op('Cambiar contraseña', true) },
      '/api/user/invite': { post: op('Invitar compañero', true) },
      '/api/client': crud('clientes'),
      '/api/client/archived': { get: op('Listar clientes archivados') },
      '/api/client/{id}': item('cliente'),
      '/api/client/{id}/restore': { patch: op('Restaurar cliente') },
      '/api/project': crud('proyectos'),
      '/api/project/archived': { get: op('Listar proyectos archivados') },
      '/api/project/{id}': item('proyecto'),
      '/api/project/{id}/restore': { patch: op('Restaurar proyecto') },
      '/api/deliverynote': crud('albaranes'),
      '/api/deliverynote/{id}': {
        get: op('Obtener albarán'), delete: op('Eliminar albarán')
      },
      '/api/deliverynote/pdf/{id}': { get: op('Descargar PDF') },
      '/api/deliverynote/{id}/sign': { patch: op('Firmar albarán') }
    })
  },
  apis: []
});
