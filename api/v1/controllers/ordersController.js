import _ from 'lodash';
import BaseController from './baseController';

export default class extends BaseController {
  constructor(client, username, attr) {
    super(client, username, attr);
    this.store = 'orderStore';
  }

  // GET /orders
  // index returns list of orders merged with corresponding ids
  index() {
    return this.client
      .search({
        store: this.store,
      })
      .then(res => _.map(res.orders, order => _.merge(order, { orderId: order.id })));
  }

  // GET /orders/:orderId
  // read implements get() method to return an order based on its id
  read(id) {
    return this.client.get({
      store: this.store,
      orderId: id,
    })
      .then(res => new Promise((resolve, reject) => {
        if (res.found) {
          return resolve(_.merge({ orderId: res.orderId }, res.value));
        }
        return reject(id);
      }));
  }

  // POST /orders
  // create makes a new order and returns orderId merged with order if successful
  create(attrs) {
    return this.client.save({
      store: this.store,
      body: attrs,
    })
      .then(res => _.merge({ orderId: res.orderId }, attrs));
  }

  // POST /orders/:orderId
  // update modifies an order and returns orderId if successful
  update(id, attrs) {
    return this.client.update({
      store: this.store,
      orderId: id,
      body: attrs,
    })
      .then(res => new Promise((resolve, reject) => {
        if (res.orderId) {
          return resolve(_.merge({ orderId: res.orderId }, attrs));
        }
        return reject(id);
      }));
  }

  cancel(id) {
    return this.client.delete({
      store: this.store,
      orderId: id,
    })
      .then(res => new Promise((resolve, reject) => {
        if (res.found) {
          return resolve(id);
        }
        return reject(id);
      }));
  }
}
