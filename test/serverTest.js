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
      orderId: '123', user: 'Steve', address: 'Andela Epic Tower', name: 'Chicken', price: 'NGN 1000.00',
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
      user: 'Anonymous', address: 'Andela HQ', name: 'Burger', price: 'NGN 800',
    }];

    before(() => {
      // we expect server to merge id attribute to the order and return attributes for the new order
      orders.create = attrs => new Promise((resolve, reject) => resolve(_.merge({ orderId: 234 },
        attrs)));
    });

    it('responds with CREATED and returns content of the newly created order with id attached', () => request
      .post('/orders')
      .send({ order: data })
      .expect(_.merge({ orderId: 234 }, data))
      .expect(201));
  });

  // ======== GET /orders/:orderId TEST =================//
  describe('GET /orders/:orderId', () => {
    // data that is returned from the controller stub
    const data = [{
      orderId: '234', user: 'Steve', address: 'Andela Epic Tower', name: 'Chicken', price: 'NGN 1000.00',
    }];

    context('when there is no post with the specified id', () => {
      // Controller should return rejected promise when order with the specified id is not found
      before(() => {
        orders.read = id => new Promise((resolve, reject) => reject(id));
      });

      // test that server responds with 404 status code if order isn't found
      it('responds with 404 Order NotFound', () => request
        .get('/orders/33')
        .send(data)
        .expect(404));
    });

    // Otherwise merge specified id with the predefined data to and sed to the controller
    before(() => {
      orders.read = id => new Promise((resolve, reject) => resolve(_.merge({ orderId: id }, data)));
    });

    it('responds with OK and returns unique order corresponding to the id', () => request
      .get('/orders/234')
      .send(data)
      .expect(_.merge({ orderId: 234 }, data))
      .expect(200));
  });
});
