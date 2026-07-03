import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/index.js';

await mongoose.connect(config.mongoUri);
const server = app.listen(config.port, () => console.log(`BildyApp en http://localhost:${config.port}`));
const shutdown = async () => { server.close(); await mongoose.disconnect(); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
