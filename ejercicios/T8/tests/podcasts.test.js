import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';

const register = async (email) => {
  const response = await request(app).post('/api/auth/register').send({
    name: 'Podcast Tester',
    email,
    password: 'TestPassword123'
  });
  return response.body;
};

const podcastData = {
  title: 'Historia de Node',
  description: 'Un podcast completo sobre el origen de Node.js',
  category: 'tech',
  duration: 1800,
  episodes: 4
};

describe('Podcast endpoints', () => {
  it('lista únicamente podcasts publicados', async () => {
    const { token } = await register('public@example.com');
    await request(app)
      .post('/api/podcasts')
      .set('Authorization', `Bearer ${token}`)
      .send(podcastData)
      .expect(201);

    const response = await request(app).get('/api/podcasts').expect(200);
    expect(response.body.data).toHaveLength(0);
  });

  it('crea podcasts solo con autenticación', async () => {
    await request(app).post('/api/podcasts').send(podcastData).expect(401);

    const { token } = await register('author@example.com');
    const response = await request(app)
      .post('/api/podcasts')
      .set('Authorization', `Bearer ${token}`)
      .send(podcastData)
      .expect(201);
    expect(response.body.data.title).toBe(podcastData.title);
  });

  it('reserva borrado, listado completo y publicación para admin', async () => {
    const normal = await register('normal@example.com');
    const admin = await register('admin@example.com');
    await User.updateOne({ email: 'admin@example.com' }, { role: 'admin' });

    const created = await request(app)
      .post('/api/podcasts')
      .set('Authorization', `Bearer ${normal.token}`)
      .send(podcastData);
    const id = created.body.data._id;

    await request(app)
      .delete(`/api/podcasts/${id}`)
      .set('Authorization', `Bearer ${normal.token}`)
      .expect(403);

    await request(app)
      .patch(`/api/podcasts/${id}/publish`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const all = await request(app)
      .get('/api/podcasts/admin/all')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(all.body.data).toHaveLength(1);

    await request(app)
      .delete(`/api/podcasts/${id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
  });
});
