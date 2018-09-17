import _ from 'lodash';
import BaseController from './baseController';
// Import test client that works with JS data structures
// import client from '../client';

// // API test store
// const store = [{
//   orderId: 'ABCDEFGHIJKLMNO',
//   name: 'Chicken',
//   price: 1000,
//   quantity: 2,
//   username: 'Steve',
//   userAddr: 'Andela',
//   userRank: 'admin',
// },
// {
//   orderId: 'PQRSTUVWXYZABCDE',
//   name: 'Meatpie',
//   price: 750,
//   quantity: 3,
//   username: 'Anonymous',
//   userAddr: 'Somewhere',
//   userRank: 'guest',
// }];

export default class extends BaseController {
  constructor(client, username) {
    super(client, username);
    this.client = client;
  }

  // GET /orders/:orderId
  // read implements getAll() to return all orders or get() to return an order based on its id
  // Error is caught on server
  read(id = '') {
    if (id === '') {
      return this.client.getAll()
        .then(store => _.map(store, order => _.merge({ orderId: order.orderId }, order)));
    }
    return this.client.get(id)
      .then(res => new Promise((resolve, reject) => {
        if (res.found) {
          return resolve(res.value);
        }
        return reject(id);
      }))
      .catch(orderId => _.merge({ status: 404 }, { error: `Invalid order Id ${orderId}` }));
  }

  // POST /orders
  // create makes a new order and returns orderId merged with order if successful
  create(order) {
    return this.client.save({
      body: order,
    }) // Merge the results obtained from save() which will be rendered by server
      .then(res => _.merge(res, { orderId: res.orderId, order: res.order }))
      .catch(id => _.merge({ error: `Id ${id} already exists!` }));
  }

  // PUT /orders/:orderId
  // update modifies an order and returns orderId if successful
  update(id, attrs) {
    return this.client.update({
      orderId: id,
      body: attrs,
    })
      .then(res => new Promise((resolve, reject) => {
        if (res.orderId) {
          return resolve(_.merge({ orderId: res.orderId }, res));
        }
        return reject(attrs.orderId);
      }))
      .catch(resId => _.merge({ status: '404', error: `Order of ID ${resId} does not exist` }));
  }

  // DELETE /orders/:id
  delete(id) {
    return this.client.cancel(id)
      .then(res => new Promise((resolve, reject) => {
        if (res.deleted) {
          return resolve(res);
        }
        return reject(id);
      }))
      .catch(resId => _.merge({ status: '404', error: `Order of ID ${resId} does not exist` }));
  }
  // End controller class
}
