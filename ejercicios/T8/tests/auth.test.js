import request from 'supertest';
import app from '../src/app.js';

const user = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123'
};

describe('Auth endpoints', () => {
  it('registra un usuario y no expone su contraseña', async () => {
    const response = await request(app).post('/api/auth/register').send(user).expect(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(user.email);
    expect(response.body.user.password).toBeUndefined();
  });

  it('rechaza datos incompletos y correos duplicados', async () => {
    await request(app).post('/api/auth/register').send(user).expect(201);
    await request(app).post('/api/auth/register').send(user).expect(409);
    await request(app).post('/api/auth/register').send({ email: 'invalid' }).expect(400);
  });

  it('inicia sesión con credenciales válidas', async () => {
    await request(app).post('/api/auth/register').send(user);
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(201);
    expect(response.body.token).toBeDefined();
  });

  it('rechaza credenciales incorrectas', async () => {
    await request(app).post('/api/auth/register').send(user);
    await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPassword123' })
      .expect(401);
  });

  it('devuelve el perfil únicamente con token', async () => {
    const registered = await request(app).post('/api/auth/register').send(user);
    await request(app).get('/api/auth/me').expect(401);
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registered.body.token}`)
      .expect(200);
    expect(response.body.email).toBe(user.email);
  });
});
