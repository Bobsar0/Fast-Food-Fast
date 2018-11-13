export default class {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * DB Query Method
   * @param {object} req
   * @param {object} res
   * @returns {object} object
   */
  // Adapted from https://www.codementor.io/olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-and-postgresql-db-masuu56t7
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

  /**
 * Create Orders Table
 */
  // Uncomment to create orders table
  // createOrdersTable() {
  //   return new Promise((resolve, reject) => {
  //     const queryText = `CREATE TABLE IF NOT EXISTS
  //     orders(
  //       orderId SERIAL PRIMARY KEY,
  //       userId INTEGER NOT NULL,
  //       food VARCHAR(512) NOT NULL,
  //       quantity INTEGER,
  //       price INTEGER,
  //       address TEXT NOT NULL,
  //       email TEXT,
  //       phone VARCHAR (20),
  //       username VARCHAR (128),
  //       status VARCHAR(20),
  //       reason TEXT,
  //       created_date TIMESTAMP default NOW(),
  //       modified_date TIMESTAMP default NOW(),
  //       FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE

  //     )`;
  //     this.pool.query(queryText)
  //       .then((res) => {
  //         console.log('created orders table!: ', res);
  //         resolve(res);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         reject(err);
  //       });
  //   });
  // }

  /**
 * Create Users Table
 */
  // // Uncomment to create users table
  // createUsersTable() {
  //   const queryText = `CREATE TABLE IF NOT EXISTS
  //       users(
  //         userId SERIAL PRIMARY KEY,
  //         username VARCHAR(128) UNIQUE NOT NULL,
  //         email VARCHAR(128) UNIQUE NOT NULL,
  //         password VARCHAR(128) NOT NULL,
  //         address TEXT,
  //         phone VARCHAR(20) UNIQUE,
  //         role VARCHAR(16) default 'user',
  //         created_date TIMESTAMP default NOW(),
  //         modified_date TIMESTAMP default NOW()
  //       )`;

  //   this.pool.query(queryText)
  //     .then((res) => {
  //       console.log('created users table!', res);
  //       return res;
  //     })
  //     .catch((err) => {
  //       console.log('err in creating users table', err);
  //       return err;
  //     });
  // }

  /**
 * Create Menu Table
 */
  // createMenuTable() {
  //   const queryText = `CREATE TABLE IF NOT EXISTS
  //     menu(
  //       foodId SERIAL PRIMARY KEY,
  //       name VARCHAR(128) UNIQUE NOT NULL,
  //       price INTEGER NOT NULL,
  //       genre VARCHAR(16) NOT NULL,
  //       img TEXT,
  //       description TEXT,
  //       isAvailable BOOLEAN,
  //       created_date TIMESTAMP DEFAULT NOW(),
  //       modified_date TIMESTAMP DEFAULT NOW()
  //     )`;

  //   this.pool.query(queryText)
  //     .then(res => console.log('created menu table!', res))
  //     .catch(err => console.log('err in creating menu table', err));
  // }

  /**
 * Delete Any Tables
 */
  // Uncomment to drop any table
  // dropTable(tableName) {
  //   const queryText = `DROP TABLE IF EXISTS ${tableName}`;
  //   this.pool.query(queryText)
  //     .then(() => {
  //       console.log(`dropped ${tableName} table`);
  //     })
  //     .catch((err) => {
  //       console.log(`err in dropping ${tableName} table: ${err}`);
  //     });
  // }

  deleteRows(tableName) {
    const query = `DELETE FROM ${tableName}`;
    this.query(query)
      .then(() => {
        console.log(`deleted all rows from ${tableName}`);
      })
      .catch((err) => {
        console.log(`error in deleting rows from ${tableName}:`, err);
      });
  }
}
