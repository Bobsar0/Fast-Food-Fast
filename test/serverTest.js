import 'babel-polyfill';
import _ from 'lodash';
import supertest from 'supertest';
import server from '../server/api/v1/server';

describe('Server', () => {
  const orders = {};
  const request = supertest(server(orders));
  // test data
  const data = {
    orderId: '234', user: 'Steve', userAddr: 'Andela Epic Tower', name: 'Chicken', price: 'NGN 1000.00',
  };
  // check that server returns success response when 'GET /orders' is performed
  describe('GET /orders', () => {
    // test method now returns test data
    before(() => {
      orders.read = () => new Promise(resolve => resolve(data));
    });

    // checks that server responds with the proper HTTP code and exactly with the
    // same data it received from the controller
    it('responds with OK', () => request
      .get('/api/v1/orders/')
      .expect(data)
      .expect(200));
  });

  // ======== GET /orders/:orderId TEST =================//
  describe('GET /orders/:orderId', () => {
    context('when there is no order with the specified id', () => {
      // Controller should return rejected promise when order with the specified id is not found
      before(() => {
        orders.read = id => new Promise((resolve, reject) => reject(id));
      });

      // test that server responds with 404 status code and custom error msg if order isn't found
      it('responds with 404 Order NotFound', () => request
        .get('/api/v1/orders/33')
        .send(data)
        .expect(404));
    });

    // Otherwise merge specified id with the predefined data to and send to the controller
    context('when there is an order with the specified id', () => {
      before(() => {
        orders.read = id => new Promise(
          resolve => resolve(_.merge({ orderId: id }, data)),
        );
      });

      it('responds with OK and returns unique order corresponding to the id', () => request
        .get('/api/v1/orders/234')
        .send(data)
        .expect(_.merge({ orderId: 234 }, data))
        .expect(200));
    });
  });

  // ======== POST /orders TEST =================//
  describe('POST /orders', () => {
    before(() => {
      // we expect server to merge id attribute to the order and return attributes for the new order
      orders.create = attrs => new Promise(resolve => resolve(attrs));
    });

    it('responds with CREATED and returns content of the newly created order with id attached', () => request
      .post('/api/v1/orders/')
      .send(data)
      .expect(data)
      .expect(201));
  });

  // ======== PUT /orders/:orderId TEST =================//
  describe('PUT /orders/:orderId', () => {
    // Update action returns order attributes corresponding to the specified id
    const attrNew = { name: 'Chicken', quantity: 3 };
    context('when there is no order with the specified id', () => {
      before(() => {
        orders.update = id => new Promise((resolve, reject) => reject(id));
      });
      it('responds with 404 HTTP response', () => request
        .put('/api/v1/orders/444')
        .send({ order: {} })
        .expect(404));
    });

    context('when there is an order with the specified id', () => {
      before(() => {
        orders.update = (id, attrs) => new Promise(
          resolve => resolve(_.merge({ orderId: id }, data, attrs)),
        );
      });
      // test below verifies status and response data
      it('responds with 200 OK and returns content of the updated order', () => request
        .put('/api/v1/orders/234')
        .send(attrNew)
        .expect(_.merge({ orderId: 234 }, data, attrNew))
        .expect(200));
    });
  });

  // ======== DELETE /orders/:orderId TEST =================//
  describe('DELETE /orders/:orderId', () => {
    context('when there is no order with the specified id', () => {
      before(() => {
        orders.delete = id => new Promise((resolve, reject) => reject(id));
      });
      it('responds with NotFound', () => request
        .delete('/api/v1/orders/555')
        .expect(404));
    });

    context('when there is an order with the specified id', () => {
      // imitate action that always returns id of the deleted order
      before(() => {
        orders.delete = orderId => new Promise(
          resolve => resolve({ orderId }),
        );
      });
      // checks that server returns deleted order with specified id
      it('responds with 204 DELETED and the id of the deleted order', () => request
        .delete('/api/v1/orders/23')
        .expect({ orderId: 23 })
        .expect(200));
    });
  });
});
