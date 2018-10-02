import dotenv from 'dotenv';
import { Pool } from 'pg';
import DB from './models/dbModel';
import Order from './models/orderModel';
import server from './server';
import OrdersController from './controllers/ordersController';

// Load .env into process.env
dotenv.config();

let orderC = {};
let connectionString = '';

if (process.env.CONTROLLER_TYPE === 'db') {
  // Connect to db
  if (process.env.NODE_ENV === 'test') {
    connectionString = process.env.DB_URL_TEST;
  } else {
    connectionString = process.env.DB_URL_LOCAL;
  }
  const pool = new Pool({
    connectionString,
  });
  pool.on('connect', () => {
  });

  const db = new DB(pool);
  db.createUsersTable();
  db.createOrdersTable();
} else {
  // API mock dB
  const dbMock = [{
    orderId: '12345',
    name: 'Chicken',
    price: 1000,
    quantity: 2,
    username: 'Steve',
    userAddr: 'Andela',
  },
  {
    orderId: '67890',
    name: 'Meatpie',
    price: 750,
    quantity: 3,
    username: 'Anonymous',
    userAddr: 'Somewhere',
  }];
  // Order uses CRUD helper functions and JS data structures to deal with order
  const order = new Order(dbMock);
  orderC = new OrdersController(order);
}

const app = server(orderC);

app.listen(process.env.PORT || 5000);
