import 'babel-polyfill';
import supertest from 'supertest';
import server from '../server';

describe('server', () => {
  // OrdersController stub
  const orders = {};
  const request = supertest(server(orders));

  // checks that server returns success response when 'GET /orders' is performed
  describe('GET /orders', () => {
    // test function that is called by the server instance
    before(() => {
      orders.index = () => new Promise((resolve, reject) => resolve({}));
    });

    it('responds with OK', () => request
      .get('/orders')
      .expect(200));
  });
});
