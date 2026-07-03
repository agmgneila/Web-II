import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Company from '../src/models/Company.js';
import User from '../src/models/User.js';

await mongoose.connect(process.env.MONGODB_URI);
const server = app.listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}/api/user`;
const suffix = Date.now();
const email = `owner.${suffix}@example.test`;
let companyId;
let logoPath;

const call = async (path, options = {}) => {
  const response = await fetch(base + path, options);
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(body)}`);
  return body;
};

try {
  const registered = await call('/register', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'OwnerTest123!' })
  });
  const headers = { authorization: `Bearer ${registered.accessToken}`, 'content-type': 'application/json' };
  const raw = await User.findOne({ email }).select('+verificationCode');
  await call('/validation', { method: 'PUT', headers, body: JSON.stringify({ code: raw.verificationCode }) });
  await call('/register', {
    method: 'PUT', headers,
    body: JSON.stringify({
      name: 'Persona', lastName: 'Prueba', nif: `T${String(suffix).slice(-8)}`,
      address: { street: 'Prueba', number: '1', postal: '28001', city: 'Madrid', province: 'Madrid' }
    })
  });
  const onboarded = await call('/company', {
    method: 'PATCH', headers,
    body: JSON.stringify({
      isFreelance: false, name: `Company ${suffix}`, cif: `B${String(suffix).slice(-8)}`,
      address: { street: 'Empresa', number: '2', postal: '28002', city: 'Madrid', province: 'Madrid' }
    })
  });
  companyId = onboarded.company._id;
  const form = new FormData();
  form.append('logo', new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }), 'logo.png');
  const logo = await call('/logo', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${registered.accessToken}` },
    body: form
  });
  logoPath = logo.logo;
  await call('/invite', {
    method: 'POST', headers,
    body: JSON.stringify({ email: `guest.${suffix}@example.test`, password: 'GuestTest123!' })
  });
  const refreshed = await call('/refresh', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: registered.refreshToken })
  });
  const profile = await call('/', { headers: { authorization: `Bearer ${refreshed.accessToken}` } });
  if (!profile.user.company || profile.user.fullName !== 'Persona Prueba') {
    throw new Error('Populate o virtual incorrecto');
  }
  await call('/password', {
    method: 'PUT', headers,
    body: JSON.stringify({ currentPassword: 'OwnerTest123!', newPassword: 'OwnerChanged123!' })
  });
  await call('/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'OwnerChanged123!' })
  });
  const guest = await call('/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: `guest.${suffix}@example.test`, password: 'GuestTest123!' })
  });
  await call('/?soft=true', {
    method: 'DELETE', headers: { authorization: `Bearer ${guest.accessToken}` }
  });
  console.log('Todos los endpoints principales de la práctica intermedia verificados');
} finally {
  await User.deleteMany({ email: { $regex: `\\.${suffix}@example\\.test$` } });
  if (companyId) await Company.deleteOne({ _id: companyId });
  if (logoPath) await unlink(join(process.cwd(), logoPath)).catch(() => {});
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
}
