import { v2 as cloudinary } from 'cloudinary';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';

export const uploadBuffer = (buffer, options = {}) => {
  if (!process.env.CLOUDINARY_URL) {
    if (process.env.NODE_ENV === 'test') {
      return Promise.resolve({ secure_url: `test://storage/${options.public_id || Date.now()}` });
    }
    if (process.env.NODE_ENV !== 'production') {
      const directory = join(process.cwd(), 'uploads', 'cloud');
      const extension = options.resource_type === 'raw' ? '.pdf' : '.webp';
      const requested = options.public_id;
      const filename = requested
        ? (extname(requested) ? requested : `${requested}${extension}`)
        : `${randomUUID()}${extension}`;
      return mkdir(directory, { recursive: true })
        .then(() => writeFile(join(directory, filename), buffer))
        .then(() => ({ secure_url: `/uploads/cloud/${filename}` }));
    }
    throw new Error('Falta CLOUDINARY_URL');
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) =>
      error ? reject(error) : resolve(result)
    );
    stream.end(buffer);
  });
};
