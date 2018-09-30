import dotenv from 'dotenv';
// import { Pool } from 'pg';
import Order from '../models/orderModel';
import server from '../server';
import OrdersController from '../controllers/ordersController';
import OrdersControllerDB from '../db/controllers/ordersControllerDB';
// import { createTables } from '../../../../db';

// Load .env into process.env
dotenv.config();

// API test store/dbMockup
const store = [{
  orderId: 'ABCDEFGHIJKLMNO',
  name: 'Chicken',
  price: 1000,
  quantity: 2,
  username: 'Steve',
  userAddr: 'Andela',
  userRank: 'admin',
},
{
  orderId: 'PQRSTUVWXYZABCDE',
  name: 'Meatpie',
  price: 750,
  quantity: 3,
  username: 'Anonymous',
  userAddr: 'Somewhere',
  userRank: 'guest',
}];

const order = new Order(store);

let orderC = {};

if (process.env.CONTROLLER_TYPE === 'db') {
  // const pool = new Pool({
  //   connectionString: process.env.DB_URL_LOCAL,
  // });
  // // Connect to db
  // pool.on('connect', () => {
  //   console.log('connected to the db');
  // });
  // createTables();
  orderC = OrdersControllerDB;
} else {
  orderC = new OrdersController(order, 'Anonymous');
}
const app = server(orderC);
const port = process.env.PORT || 5000;

app.listen(port);
