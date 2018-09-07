import client from '../client';
import servers from '../server';
import OrdersController from '../controllers/ordersController';
import config from '../config/config';

const attr = {};
// attr.name = 'Chicken';
// attr.price = '1000';
// attr.username = 'Steve';
// attr.userAddr = 'Andela Epic Tower';
// attr.orderId = 'ABCDEFGHIJKLMNO';

// const orderModel = new Order()
const orders = new OrdersController(client, 'Steve', attr);
const server = servers(orders);

server.listen(config.local.port, () => console.log(`Server listening at port ${config.local.port}...`));
