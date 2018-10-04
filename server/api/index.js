import dotenv from 'dotenv';
import { Pool } from 'pg';
import DB from './models/dbModel';
import Order from './models/orderModel';
import server from './server';
import OrdersController from './controllers/ordersController';
import OrdersDBController from './controllers/ordersDBcontroller';
import UsersController from './controllers/usersController';
import User from './models/userModel';
import Auth from './models/authmodel';
import AuthC from './controllers/authController';


// Load .env into process.env
dotenv.config();

let userC = {};
let orderC = {};
let connectionString = '';

if (process.env.CONTROLLER_TYPE === 'db') {
  // Connect to db specific to environment
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
  // db.createUsersTable();
  // db.createOrdersTable();

  const auth = new Auth();
  const userM = new User();
  userC = new UsersController(db, userM, auth);

  orderC = new OrdersDBController(db);
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
  const orderM = new Order(dbMock);
  orderC = new OrdersController(orderM);
}

const app = server(orderC, AuthC, userC);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('listening at port', port));
