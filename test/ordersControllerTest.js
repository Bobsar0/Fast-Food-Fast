import 'babel-polyfill';
import sinon from 'sinon';
import 'should-sinon';
import _ from 'lodash';
import OrdersController from '../api/v1/controllers/ordersController';

describe('OrdersController', () => {
  // introdue external client stub
  const client = {};
  const orders = new OrdersController(client, 'Steve', 'orders');

  // GET /orders test
  // index should return list of orders merged with corresponding ids
  describe('index', () => {
    before(() => {
      client.search = () => new Promise(resolve => resolve({
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

    it('specifies proper username and attr while searching', () => {
      // import sinon for spying on method calls
      const spy = sinon.spy(client, 'search');
      // search() method should be called once with proper username and attributes as paramters.
      return orders.index().then(() => {
        spy.should.be.calledOnce();
        spy.should.be.calledWith({
          user: 'Steve',
          attr: 'orders',
        });
      });
    });
  });
  // POST /orders test
  // create should establish a new order
  describe('create', () => {
    const attrs = {
      name: 'Cocktail', price: '1200', username: 'Steve', userAddr: 'Andela Epic Tower',
    };
    before(() => {
      client.save = () => new Promise(resolve => resolve({
        store: 'orderStore',
        orderId: 'ABCDEFGHIJKLMNO',
        created: true,
      }));
    });
    it('parses and returns order data', () => {
      orders.create(attrs).then(result => result.should.deepEqual(_.merge({ orderId: 'ABCDEFGHIJKLMNO' }, attrs)));
    });
  });
});
