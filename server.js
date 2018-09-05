import express from 'express';
import OrdersController from './controllers/orders';


const server = express();
const orders = new OrdersController();

// Server responds with the empty object for now. Content
// is not tested yet, just server availability.
server.get('/orders', (req, res) => orders.index().then(result => res.send(200, result)));

export default server;
