import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';

const signature = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 60 Q80 5 190 50" fill="none" stroke="black"/></svg>'
);

describe('BildyApp final', () => {
  it('completa usuarios, clientes, proyectos, albaranes, PDF y firma', async () => {
    const email = 'owner@example.test';
    const registered = await request(app).post('/api/user/register')
      .send({ email, password: 'OwnerTest123!' }).expect(201);
    let token = registered.body.accessToken;
    let auth = { Authorization: `Bearer ${token}` };
    const raw = await User.findOne({ email }).select('+verificationCode');
    await request(app).put('/api/user/validation').set(auth)
      .send({ code: raw.verificationCode }).expect(200);
    await request(app).put('/api/user/register').set(auth).send({
      name: 'Persona', lastName: 'Prueba', nif: '00000000T',
      address: { street: 'Uno', number: '1', postal: '28001', city: 'Madrid', province: 'Madrid' }
    }).expect(200);
    await request(app).patch('/api/user/company').set(auth).send({
      isFreelance: false, name: 'Empresa Prueba', cif: 'B00000000',
      address: { street: 'Dos', number: '2', postal: '28002', city: 'Madrid', province: 'Madrid' }
    }).expect(200);

    await request(app).get('/api/user').set(auth).expect(200);
    const client = await request(app).post('/api/client').set(auth).send({
      name: 'Cliente Prueba', cif: 'A00000000', email: 'client@example.test',
      phone: '600000000',
      address: { street: 'Tres', number: '3', postal: '28003', city: 'Madrid', province: 'Madrid' }
    }).expect(201);
    const clientId = client.body.data._id;
    await request(app).get('/api/client?name=Prueba').set(auth).expect(200);
    await request(app).get(`/api/client/${clientId}`).set(auth).expect(200);
    await request(app).put(`/api/client/${clientId}`).set(auth).send({ phone: '611111111' }).expect(200);
    await request(app).delete(`/api/client/${clientId}?soft=true`).set(auth).expect(200);
    await request(app).get('/api/client/archived').set(auth).expect(200);
    await request(app).patch(`/api/client/${clientId}/restore`).set(auth).expect(200);

    const project = await request(app).post('/api/project').set(auth).send({
      client: clientId, name: 'Proyecto Prueba', projectCode: 'PR-001',
      address: { street: 'Cuatro', number: '4', postal: '28004', city: 'Madrid', province: 'Madrid' },
      email: 'project@example.test', notes: 'Proyecto de integración'
    }).expect(201);
    const projectId = project.body.data._id;
    await request(app).get(`/api/project?client=${clientId}`).set(auth).expect(200);
    await request(app).get(`/api/project/${projectId}`).set(auth).expect(200);
    await request(app).put(`/api/project/${projectId}`).set(auth).send({ active: false }).expect(200);
    await request(app).delete(`/api/project/${projectId}?soft=true`).set(auth).expect(200);
    await request(app).get('/api/project/archived').set(auth).expect(200);
    await request(app).patch(`/api/project/${projectId}/restore`).set(auth).expect(200);

    const note = await request(app).post('/api/deliverynote').set(auth).send({
      client: clientId, project: projectId, format: 'hours',
      description: 'Trabajo realizado', workDate: '2026-07-03',
      workers: [{ name: 'Operario', hours: 8 }]
    }).expect(201);
    const noteId = note.body.data._id;
    await request(app).get('/api/deliverynote?format=hours').set(auth).expect(200);
    await request(app).get(`/api/deliverynote/${noteId}`).set(auth).expect(200);
    await request(app).get(`/api/deliverynote/pdf/${noteId}`).set(auth)
      .expect('Content-Type', /pdf/).expect(200);
    await request(app).patch(`/api/deliverynote/${noteId}/sign`).set(auth)
      .attach('signature', signature, { filename: 'firma.svg', contentType: 'image/svg+xml' }).expect(200);
    await request(app).delete(`/api/deliverynote/${noteId}`).set(auth).expect(409);

    await request(app).post('/api/user/invite').set(auth)
      .send({ email: 'guest@example.test', password: 'GuestTest123!' }).expect(201);
    const guest = await request(app).post('/api/user/login')
      .send({ email: 'guest@example.test', password: 'GuestTest123!' }).expect(200);
    await request(app).delete('/api/user?soft=true')
      .set({ Authorization: `Bearer ${guest.body.accessToken}` }).expect(200);

    const refreshed = await request(app).post('/api/user/refresh')
      .send({ refreshToken: registered.body.refreshToken }).expect(200);
    token = refreshed.body.accessToken;
    auth = { Authorization: `Bearer ${token}` };
    await request(app).put('/api/user/password').set(auth)
      .send({ currentPassword: 'OwnerTest123!', newPassword: 'ChangedTest123!' }).expect(200);
    await request(app).post('/api/user/login')
      .send({ email, password: 'ChangedTest123!' }).expect(200);
  });
});
