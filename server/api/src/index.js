import Order from '../models/orderModel';
import server from '../server';
import OrdersController from '../controllers/ordersController';

// API test dB
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
const orderC = new OrdersController(order);
const app = server(orderC);

app.listen(process.env.PORT || 5000);
