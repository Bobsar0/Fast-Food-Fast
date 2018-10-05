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

if (process.env.CONTROLLER_TYPE !== 'local') {
  // Connect to db specific to environment
  if (process.env.NODE_ENV === 'test') {
    connectionString = process.env.DB_URL_TEST;
  } else {
    // For Heroku
    connectionString = process.env.DATABASE_URL;
  }
  const pool = new Pool({
    connectionString,
    // COMMENT LINE BELOW IF ON LOCAL HOST
    ssl: true,
  });
  pool.on('connect', () => {
  });

  const db = new DB(pool);
  // db.dropMenuTable();
  // db.dropOrdersTables();
  // db.dropUsersTable();
  // COMMENT BELOW 4 LINES AFTER RUNNING FOR THE FIRST TIME
  // db.alterTableColumn('users', 'rank', 'role');
  // db.createUsersTable();
  // db.createOrdersTable();
  db.createMenuTable();

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
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('listening at port', port));
