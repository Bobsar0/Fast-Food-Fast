import 'babel-polyfill';
import supertest from 'supertest';
import server from '../server';

describe('server', () => {
  const orders = {};
  const request = supertest(server(orders));

  // checks that server returns success response when 'GET /orders' is performed
  describe('GET /orders', () => {
    // test data that is returned by the orders controller stub
    const data = [{
      orderId: '123', user: 'Steve', name: 'Chicken', price: 'NGN 1000.00',
    }];

    // test method now returns test data
    before(() => {
      orders.index = () => new Promise((resolve, reject) => resolve(data));
    });

    // checks that server responds with the proper HTTP code and exactly with the
    // same data it received from the controller
    it('responds with OK', () => request
      .get('/orders')
      .expect(data)
      .expect(200));
  });
});
