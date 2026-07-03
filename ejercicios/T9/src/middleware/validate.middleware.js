export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!parsed.success) {
    return next(Object.assign(new Error('Datos inválidos'), {
      status: 400,
      details: parsed.error.flatten()
    }));
  }
  Object.assign(req, parsed.data);
  next();
};
