import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load .env into process.env
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Connect to db
pool.on('connect', () => {
  console.log('connected to the db');
});

/**
 * Create Tables
 */
const createTables = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
      orders(
        orderId serial PRIMARY KEY,
        userId serial REFERENCES users(userId) ON DELETE CASCADE
        name VARCHAR(128) NOT NULL,
        quantity NUMBER NOT NULL,
        price MONEY NOT NULL,
        userAddr VARCHAR(255)
        created_at TIMESTAMP DEFAULT NOW(),
        modified_at TIMESTAMP DEFAULT NOW()
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
};

/**
 * Drop Tables
 */
const dropTables = () => {
  const queryText = 'DROP TABLE IF EXISTS reflections';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
};

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});
export {
  createTables,
  dropTables,
};

require('make-runnable');
