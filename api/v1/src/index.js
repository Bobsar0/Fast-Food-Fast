import client from '../client';
import servers from '../server';
import OrdersController from '../controllers/ordersController';
import config from '../config/config';

const orders = new OrdersController(client, 'Steve', 'orders');
const server = servers(orders);

server.listen(config.local.port, () => console.log(`Server listening at port ${config.local.port}...`));
