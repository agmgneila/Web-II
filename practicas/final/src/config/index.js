export const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI,
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTtl: process.env.REFRESH_TOKEN_TTL || '7d'
};
