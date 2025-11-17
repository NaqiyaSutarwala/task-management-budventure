export const jwtConstants = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'accessSecretKey',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME || 'rt',
};
