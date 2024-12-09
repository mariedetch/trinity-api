export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'test',
    password: process.env.DB_PASSWORD || 'test',
    database: process.env.DB_DATABASE || 'test',
  },
});
