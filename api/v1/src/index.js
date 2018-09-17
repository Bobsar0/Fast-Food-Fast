import Client from '../client';
import servers from '../server';
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

// Client uses CRUD helper functions and JS data structures to deal with order
const client = new Client(store);
const orders = new OrdersController(client, 'Anonymous');
const server = servers(orders);

server.listen(process.env.PORT || 5000);
