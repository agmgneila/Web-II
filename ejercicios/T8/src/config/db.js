import mongoose from 'mongoose';

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('âœ… Conectado a MongoDB');
  } catch (error) {
    console.error('âŒ Error conectando a MongoDB:', error.message);
    throw error;
  }
};

export default dbConnect;

