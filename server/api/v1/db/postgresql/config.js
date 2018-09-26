// USING PG WITHOUT PROMISE
// const orderConnectionStr = process.env.DATABASE_URL || 'postgres://localhost:5432/order';

// // CREATE ORDER TABLE
// // Create a new instance of pg Client to interact with the database
// const dbClient = new pg.Client(orderConnectionStr);
// // Establish communication with the client
// dbClient.connect();
// const query = dbClient.query(
//   'CREATE TABLE orders(orderId SERIAL PRIMARY KEY, text constCHAR(40) not null, complete BOOLEAN)',
// );
// // Close communication via end() method
// query.on('end', () => { dbClient.end(); });

import promise from 'bluebird';

const options = {
  // Initialization Options
  promiseLib: promise,
};

const pgp = require('pg-promise')(options);

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/orders';
const db = pgp(connectionString);


// // add query functions (controller)
// module.exports = {
//   getAllorders,
//   getSingleorder,
//   createorder,
//   updateorder,
//   removeorder,
// };
