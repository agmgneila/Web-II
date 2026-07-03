import multer from 'multer';
export const signatureUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(
    file.mimetype.startsWith('image/') ? null : new Error('Solo se permiten imágenes'),
    file.mimetype.startsWith('image/')
  )
}).single('signature');
