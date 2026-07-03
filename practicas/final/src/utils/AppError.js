export default class AppError extends Error {
  constructor(status, message, details) {
    super(message); this.status = status; this.details = details;
  }
  static badRequest(message) { return new AppError(400, message); }
  static unauthorized(message = 'No autorizado') { return new AppError(401, message); }
  static forbidden(message = 'Sin permisos') { return new AppError(403, message); }
  static notFound(resource) { return new AppError(404, `${resource} no encontrado`); }
  static conflict(message) { return new AppError(409, message); }
  static validation(message, details) { return new AppError(422, message, details); }
}
