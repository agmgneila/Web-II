export const notFound = (_req, res) => res.status(404).json({ message: 'Ruta no encontrada' });

export const errorHandler = (error, _req, res, _next) => {
  if (error.code === 11000) return res.status(409).json({ message: 'El registro ya existe' });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Identificador inválido' });
  if (error.name === 'MulterError') return res.status(400).json({ message: error.message });
  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Error interno' : error.message,
    ...(error.details && { details: error.details })
  });
};
