import 'babel-polyfill';
import OrdersController from '../server/api/controllers/ordersController';
import Order from '../server/api/models/orderModel';

describe('OrdersController', () => {
  const orderStore = [{
    orderId: 'ABCDEFGHIJKLMNO',
    name: 'Chicken',
    price: 1000,
    quantity: 2,
    username: 'Steve',
    userAddr: 'Andela',
    userRank: 'admin',
  },
  {
    orderId: 'PQRSTUVWXYZABCDE',
    name: 'Rice',
    price: 800,
    quantity: 1,
    username: 'Anonymous',
    userAddr: 'Somewhere',
    userRank: 'guest',
  }];
  // introduce external order
  const orderM = new Order(orderStore);
  // introduce external ordersController
  const orderC = new OrdersController(orderM, 'Steve');


  // GET /orders test
  // index should return list of orders merged with corresponding ids
  describe('READ', () => {
    before(() => {
      orderM.getAll = () => new Promise(resolve => resolve(orderStore));
    });
    // check to see if it correctly parses and returns post data
    it('parses and returns post data', () => orderC.read().then(result => result.should.deepEqual(orderStore)));
  });

  // GET /orders:orderId test
  // read should get an order by id
  describe('READByID', () => {
    const id = 'ABCDEFGHIJKLMNO';
    const idInvalid = 'ABCD';

    context('When there is no order matching the id', () => {
      before(() => {
        orderM.get = () => new Promise(resolve => resolve({
          orderId: idInvalid,
          found: false,
        }));
      });

      it('returns rejected promise with the non existent id', () => orderC.read(idInvalid).catch(result => result.should.equal(idInvalid)));
    });

    context('When there is an order matching the id!', () => {
      before(() => {
        orderM.get = () => new Promise(resolve => resolve({
          orderId: id,
          found: true,
          value: orderM.store[0],
        }));
      });
      it('parses and returns order data', () => {
        orderC.read(id).then(result => result.should.equal(orderStore[0]));
      });
    });
  });

  // POST /orders test
  // create should establish a new order
  describe('CREATE', () => {
    const order = {
      orderId: 'FGHIJKLMNOPQRSTU', name: 'Cocktail', price: '1200', quantity: 2, username: 'Steve', userAddr: 'Andela Epic Tower', userRank: 'admin',
    };
    const res = {
      orderId: order.orderId,
      created: true,
      createdAt: Date(),
      updatedAt: Date(),
      order,
    };
    before(() => {
      orderM.save = () => new Promise(resolve => resolve(res));
    });
    it('parses and returns order data', () => {
      orderC.create(order).then(result => result.should.deepEqual(res));
    });
  });

  // POST /orders/:orderId test
  // update should modify an order and return orderId if successful
  describe('UPDATE', () => {
    const order = {
      orderId: 'ABCDEFGHIJKLMNO', name: 'Chicken', price: '1800', quantity: 3, username: 'Steve', userAddr: 'Andela Epic Tower', userRank: 'admin',
    };
    const orderInvalid = {
      orderId: 'ABCDE', name: 'Meatpie', price: '750', quantity: 3, username: 'Anonymous', userAddr: 'Andela', userRank: 'guest',
    };

    context('when there is no order with the specified id', () => {
      before(() => {
        orderM.update = () => new Promise(resolve => resolve({
          error: 'Order not found!',
          status: 404,
        }));
      });
      it('returns rejected promise with the non existing post id', () => orderC.update(orderInvalid)
        .catch(result => result.should.deepEqual(orderInvalid.orderId)));
    });

    context('when there is an order with the specified id!', () => {
      const res = {
        orderId: order.orderId,
        updated: true,
        updatedAt: Date(),
        newOrder: order,
      };
      before(() => {
        orderM.update = () => new Promise(resolve => resolve(res));
      });
      it('parses and returns post data', () => {
        orderC.update(order.orderId, order)
          .then(result => result.should.deepEqual(res));
      });
    });
  });

  // DELETE /orders/:orderId test
  //  cancel should delete an order from store if found
  describe('DELETE', () => {
    const id2 = 'ABCDD';

    context('when there is no order with the specified id', () => {
      before(() => {
        orderM.cancel = () => new Promise(resolve => resolve({
          deleted: false,
          orderId: id2,
        }));
      });

      // checks that promise is rejected
      it('returns rejected promise with the non existing post id', () => orderC.delete(id2).catch(result => result.should.equal(id2)));
    });

    context('when there is an order with the specified id', () => {
      before(() => {
        orderM.cancel = () => new Promise(resolve => resolve({
          orderId: orderStore[1].orderId,
          deleted: true,
        }));
      });

      it('parses and returns order data', () => orderC.delete(orderStore[1].orderId)
        .then(result => result.should.deepEqual(
          { orderId: orderStore[1].orderId, deleted: true },
        )));
    });
  });
});
