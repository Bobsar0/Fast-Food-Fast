// This acts as dbmodel!!!. SHould include query

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
  console.log('created table');

  const queryText = `CREATE TABLE IF NOT EXISTS
      orders(
        orderId SERIAL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        genre VARCHAR(128)
        userAddr VARCHAR(255),
        created_at TIMESTAMP default NOW(),
        modified_at TIMESTAMP default NOW(),
      )`;
  pool.query(queryText)
    .then((res) => {
      console.log('created table: ', res);
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
  console.log('dropped table: ');
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
