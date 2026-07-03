import { v2 as cloudinary } from 'cloudinary';

export const uploadBuffer = (buffer, options = {}) => {
  if (!process.env.CLOUDINARY_URL) {
    if (process.env.NODE_ENV === 'test') {
      return Promise.resolve({ secure_url: `test://storage/${options.public_id || Date.now()}` });
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
