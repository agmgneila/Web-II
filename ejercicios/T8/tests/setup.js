import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-only-secret-not-used-outside-tests';
  process.env.NODE_ENV = 'test';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) =>
      collection.deleteMany({})
    )
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
