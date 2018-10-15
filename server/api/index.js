import dotenv from 'dotenv';
import { Pool } from 'pg';
import DB from './models/dbModel';
import Order from './models/orderModel';
import server from './server';
import OrdersController from './controllers/ordersController';
import OrdersDBController from './controllers/ordersDBcontroller';
import UsersController from './controllers/usersController';
import MenuController from './controllers/menuController';
import User from './models/userModel';
import Auth from './models/authModel';


// Load .env into process.env
dotenv.config();

let userC = {};
let orderC = {};
let menuC = {};
let connectionString = '';
let ssl = false;

if (process.env.CONTROLLER_TYPE !== 'dataStructures') {
  // Connect to db specific to environment
  if (process.env.NODE_ENV === 'test') {
    connectionString = 'postgres://cfsezloo:oA41pLZTXNtBIR_vxJHO-ZXqwHM0lAzR@tantor.db.elephantsql.com:5432/cfsezloo';
  } else if (process.env.NODE_ENV === 'local') {
    connectionString = process.env.DB_URL_LOCAL;
  } else {
    // For Heroku
    connectionString = process.env.DATABASE_URL;
    ssl = true;
  }
  const pool = new Pool({
    connectionString,
    ssl,
  });
  pool.on('connect', () => {
  });

  const db = new DB(pool);
  // db.dropTable('menu');
  // db.dropTable('orders');
  // db.dropTable('users');
  // db.createUsersTable();
  // db.createOrdersTable();
  // db.createMenuTable();

  const auth = new Auth();
  const userM = new User();
  userC = new UsersController(db, userM, auth);
  orderC = new OrdersDBController(db);
  menuC = new MenuController(db);
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

const app = server(orderC, userC, menuC);
const port = process.env.PORT || 9999;
app.listen(port, () => console.log('listening at port', port));
