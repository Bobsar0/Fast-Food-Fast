import Order from '../models/orderModel';
import server from '../server';
import OrdersController from '../controllers/ordersController';

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

// Order uses CRUD helper functions and JS data structures to deal with order
const order = new Order(store);
const orders = new OrdersController(order, 'Anonymous');
const app = server(orders);

app.listen(process.env.PORT || 5000);
