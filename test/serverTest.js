import 'babel-polyfill';
import _ from 'lodash';
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

  // ======== POST /orders TEST =================//
  describe('POST /orders', () => {
    // data sent to the server
    const data = [{
      user: 'Anonymous', name: 'Burger', price: 'NGN 800',
    }];

    before(() => {
      // we expect server to merge id attribute to the order and return attributes for the new order
      orders.create = attrs => new Promise((resolve, reject) => resolve(_.merge({ orderId: 234 },
        attrs)));
    });

    it('responds with CREATED and returns content of the newly created order with ID', () => request
      .post('/orders')
      .send({ order: data })
      .expect(_.merge({ orderId: 234 }, data))
      .expect(201));
  });
});


