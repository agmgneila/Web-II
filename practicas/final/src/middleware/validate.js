import AppError from '../utils/AppError.js';

export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!parsed.success) return next(AppError.validation('Datos inválidos', parsed.error.flatten()));
  if (parsed.data.body) req.body = parsed.data.body;
  if (parsed.data.params) Object.assign(req.params, parsed.data.params);
  if (parsed.data.query) req.validatedQuery = parsed.data.query;
  next();
};
