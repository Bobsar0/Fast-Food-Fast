import dotenv from 'dotenv';
import Order from '../models/orderModel';
import server from '../server';
import OrdersController from '../controllers/ordersController';
import OrdersControllerDB from '../db/controllers/ordersControllerDB';

// API test store
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

dotenv.config();

const order = new Order(store);
let orderC = {};
if (process.env.CONTROLLER_TYPE === 'db') {
  orderC = OrdersControllerDB;
} else {
  orderC = new OrdersController(order, 'Anonymous');
}
const app = server(orderC);

app.listen(process.env.PORT || 5000);
