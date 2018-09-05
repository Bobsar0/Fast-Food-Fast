import servers from '../server';
import OrdersController from '../controllers/ordersController';

const orders = new OrdersController();
const server = servers(orders);

server.listen(8080, () => console.log('Server listening at port 8080...'));
