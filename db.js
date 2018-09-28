const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load .env into process.env
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DB_URL_LOCAL,
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
        orderId SERIAL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        userAddr VARCHAR(255),
        created_at TIMESTAMP,
        modified_at TIMESTAMP
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
  const queryText = 'DROP TABLE IF EXISTS orders';
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
module.exports = {
  createTables,
  dropTables,
};

require('make-runnable');
