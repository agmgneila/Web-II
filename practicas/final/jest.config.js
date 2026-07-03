export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/index.js'],
  coverageThreshold: { global: { lines: 70 } }
};
