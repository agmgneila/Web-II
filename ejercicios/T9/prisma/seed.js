import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;
if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
  throw new Error('Define SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD para crear el administrador');
}

await prisma.user.upsert({
  where: { email: SEED_ADMIN_EMAIL.toLowerCase() },
  update: { role: 'ADMIN' },
  create: {
    name: 'Administrador',
    email: SEED_ADMIN_EMAIL.toLowerCase(),
    password: await bcrypt.hash(SEED_ADMIN_PASSWORD, 10),
    role: 'ADMIN'
  }
});

await prisma.$disconnect();
console.log('Administrador creado o actualizado');
