import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load .env into process.env
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('connected to the db');
});
