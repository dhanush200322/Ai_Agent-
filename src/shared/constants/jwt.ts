export const JWT_CONFIG = {
  ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '30d',
};
