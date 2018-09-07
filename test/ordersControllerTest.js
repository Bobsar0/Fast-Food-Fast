import sinon from 'sinon';
import 'should-sinon';
import OrdersController from '../api/v1/controllers/ordersController';

describe('OrdersController', () => {
  // introdue external client stub
  const client = {};
  const orders = new OrdersController(client, 'Steve', 'bobsarglobal@gmail.com');

  // index should return list of orders merged with corresponding ids
  describe('index', () => {
    before(() => {
      client.search = () => new Promise((resolve, reject) => resolve({
        orders: [{
          orderId: 'ABCDEFGHIJKLMNO',
          name: 'Chicken',
          price: 1000,
          username: 'Steve',
          userAddr: 'Andela',
          userRank: 'admin',
        },
        {
          orderId: 'PQRSTUVWXYZABCDE',
          name: 'Rice',
          price: 800,
          username: 'Anonymous',
          userAddr: 'Somewhere',
          userRank: 'guest',
        }],
      }));
    });
    // check to see if it correctly parses and returns post data
    it('parses and returns post data', () => orders.index().then(result => result.should.deepEqual([{
      orderId: 'ABCDEFGHIJKLMNO',
      name: 'Chicken',
      price: 1000,
      username: 'Steve',
      userAddr: 'Andela',
      userRank: 'admin',
    },
    {
      orderId: 'PQRSTUVWXYZABCDE',
      name: 'Rice',
      price: 800,
      username: 'Anonymous',
      userAddr: 'Somewhere',
      userRank: 'guest',
    }])));

    it('specifies proper username and email while searching', () => {
      // import sinon for spying on method calls
      const spy = sinon.spy(client, 'search');
      // search() method should be called once with proper username and email as paramters.
      return orders.index().then(() => {
        spy.should.be.calledOnce();
        spy.should.be.calledWith({
          user: 'Steve',
          email: 'bobsarglobal@gmail.com',
        });
      });
    });
  });
});
