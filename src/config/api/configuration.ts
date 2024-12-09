export default () => ({
  api: {
    globalPrefix: process.env.API_GLOBAL_PREFIX || 'api',
    rateLimit: {
      max: parseInt(process.env.API_RATE_LIMIT_MAX, 10) || 100,
      windowMs:
        parseInt(process.env.API_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    },
    cors: {
      enabled: process.env.API_CORS_ENABLED === 'true',
      origin: process.env.API_CORS_ORIGIN || '*',
    },
    pagination: {
      defaultLimit:
        parseInt(process.env.API_PAGINATION_DEFAULT_LIMIT, 10) || 10,
      maxLimit: parseInt(process.env.API_PAGINATION_MAX_LIMIT, 10) || 50,
    },
  },
});
