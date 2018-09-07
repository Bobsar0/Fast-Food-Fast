import _ from 'lodash';

export default class {
  constructor(client, username) {
    this.client = client;
    this.username = username;
    this.attr = 'orders';
    this.store = 'orderStore';
  }

  // GET /orders
  // index returns list of orders merged with corresponding ids
  index() {
    return this.client
      .search({
        user: this.username,
        attr: this.attr,
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
      .then(res => _.merge({ orderId: res.orderId }, res.value));
  }

  // POST /orders
  // create creates a new order and returns orderId if successful
  create(attrs) {
    return this.client.save({
      store: this.store,
      body: attrs,
    })
      .then(res => _.merge({ orderId: res.orderId }, attrs));
  }
}
