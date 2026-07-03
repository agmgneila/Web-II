import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { server } from './app.js';

await connectDb();
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Chat disponible en http://localhost:${port}`));

const shutdown = async () => {
  server.close();
  await mongoose.disconnect();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
