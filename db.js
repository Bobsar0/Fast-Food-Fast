// This acts as dbmodel!!!. SHould include query

// const { Pool } = require('pg');
// import dotenv from 'dotenv'

// // Load .env into process.env
// dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DB_URL_LOCAL,
// });

// // Connect to db
// pool.on('connect', () => {
//   console.log('connected to the db');
// });


export default class {
  constructor(pool) {
    this.pool = pool;
  }

  /**
 * Create Orders Table
 */
  createOrdersTable() {
    const queryText = `CREATE TABLE IF NOT EXISTS
      orders(
        orderId SERIAL PRIMARY KEY,
        owner_id INTEGER NOT NULL,
        name VARCHAR(128) NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        genre VARCHAR(128),
        userAddr VARCHAR(255),
        created_at TIMESTAMP default NOW(),
        modified_at TIMESTAMP default NOW(),
        FOREIGN KEY (owner_id) REFERENCES users (userId) ON DELETE CASCADE
      )`;
    this.pool.query(queryText)
      .then((res) => {
        console.log('created orders table!: ', res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * Drop Orders Tables
   */
  dropOrdersTables() {
    const queryText = 'DROP TABLE IF EXISTS orders';
    this.pool.query(queryText)
      .then((res) => {
        console.log('dropped orders table', res);
        // this.pool.end();
      })
      .catch((err) => {
        console.log(err);
        // this.pool.end();
      });
  }

  /**
 * Create Users Table
 */
  createUsersTable() {
    const queryText = `CREATE TABLE IF NOT EXISTS
        users(
          userId SERIAL PRIMARY KEY,
          username VARCHAR(128) UNIQUE NOT NULL,
          email VARCHAR(128) UNIQUE NOT NULL,
          password VARCHAR(128) NOT NULL,
          user_rank VARCHAR(128),
          created_date TIMESTAMP default NOW(),
          modified_date TIMESTAMP default NOW()
        )`;

    this.pool.query(queryText)
      .then((res) => {
        console.log('created users table!', res);
        // this.pool.end();
      })
      .catch((err) => {
        console.log('err in creating users table', err);
        // this.pool.end();
      });
  }

  /**
   * Drop Orders Tables
   */
  dropUsersTable() {
    const queryText = 'DROP TABLE IF EXISTS users';
    this.pool.query(queryText)
      .then((res) => {
        console.log('dropped users table!:', res);
        // this.pool.end()
      })
      .catch((err) => {
        console.log(err);
        // this.pool.end();
      });
  }

  /**
   * DB Query Method
   * @param {object} req
   * @param {object} res
   * @returns {object} object
   */
  // Reference source
  query(text, params) {
    return new Promise((resolve, reject) => {
      this.pool.query(text, params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

// pool.on('remove', () => {
//   console.log('client removed');
//   process.exit(0);
// });
// module.exports = {
//   createOrdersTables,
//   dropTables,
// };

// require('make-runnable');
