import _ from 'lodash';

export default class {
  constructor(client) {
    this.client = client;
  }

  // GET /orders
  // index returns list of orders merged with corresponding ids
  index() {
    return this.client
      .search()
      .then(res => _.map(res.orders, order => _.merge(order, { orderId: order.id })));
  }
}
