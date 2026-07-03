import app from './app.js';
import prisma from './config/prisma.js';

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Biblioteca API en http://localhost:${port}`));

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
