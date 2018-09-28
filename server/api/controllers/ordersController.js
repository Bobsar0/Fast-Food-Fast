import _ from 'lodash';
import BaseController from './baseController';

export default class extends BaseController {
  constructor(client, username) {
    super(client, username);
    this.orders = client;
  }

  // GET /orders/:orderId
  // read implements getAll() to return all orders or get() to return an order based on its id
  // Error is caught on server
  read(id = '') {
    if (id === '') {
      return this.orders.getAll()
        .then(store => _.map(store, order => _.merge({ orderId: order.orderId }, order)));
    }
    return this.orders.get(id)
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
    return this.orders.save({
      body: order,
    }) // Merge the results obtained from save() which will be rendered by server
      .then(res => _.merge(res, { orderId: res.orderId, order: res.order }))
      .catch(id => _.merge({ error: `Id ${id} already exists!` }));
  }

  // PUT /orders/:orderId
  // update modifies an order and returns orderId if successful
  update(id, attrs) {
    return this.orders.update({
      orderId: id,
      body: attrs,
    })
      .then(res => new Promise((resolve, reject) => {
        if (res.orderId) {
          return resolve(_.merge({ orderId: res.orderId }, res));
        }
        return reject(attrs);
      }))
      .catch(resId => _.merge({ status: '404', error: `Order of ID ${resId} does not exist` }));
  }

  // DELETE /orders/:id
  delete(id) {
    return this.orders.cancel(id)
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
