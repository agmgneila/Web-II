import mongoose from 'mongoose';
import { createServer } from 'node:http';
import app from './app.js';
import { config } from './config/index.js';
import { configureSocket } from './socket/index.js';

await mongoose.connect(config.mongoUri);
const server = createServer(app);
const io = configureSocket(server);
server.listen(config.port, () => console.log(`BildyApp final en http://localhost:${config.port}`));
const shutdown = async () => {
  await new Promise((resolve) => io.close(resolve));
  await mongoose.disconnect();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
