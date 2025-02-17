const { DataSource } = require("typeorm");
require("dotenv").config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity.js'],
  seeds: ['dist/database/seeders/*.js'],
  factories: ['dist/database/factories/*.js'],
  synchronize: false,
  migrationsRun: true
});

module.exports = AppDataSource;
