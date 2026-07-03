import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import multer from 'multer';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const storage = multer.diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_req, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname)}`)
});
export const uploadLogo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, allowed.has(file.mimetype))
}).single('logo');
