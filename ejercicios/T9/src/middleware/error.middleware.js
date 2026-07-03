export const notFound = (_req, res) => res.status(404).json({ message: 'Ruta no encontrada' });

export const errorHandler = (error, _req, res, _next) => {
  if (error.code === 'P2002') return res.status(409).json({ message: 'El registro ya existe' });
  if (error.code === 'P2025') return res.status(404).json({ message: 'Registro no encontrado' });
  res.status(error.status || 500).json({
    message: error.status ? error.message : 'Error interno',
    ...(error.details && { details: error.details })
  });
};
