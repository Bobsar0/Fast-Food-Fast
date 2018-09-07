import _ from 'lodash';

export default class {
  constructor(client, username) {
    this.client = client;
    this.username = username;
    this.attr = 'orders';
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

  // POST /orders
  // create creates a new order and returns orderId if successful
  create(attrs) {
    return this.client.save({
    })
      .then(res => _.merge({ orderId: res.orderId }, attrs));
  }
}
