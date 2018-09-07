import _ from 'lodash';

export default class {
  constructor(client, username, email) {
    this.client = client;
    this.username = username;
    this.email = email;
  }

  // GET /orders
  // index returns list of orders merged with corresponding ids
  index() {
    return this.client
      .search({
        user: this.username,
        email: this.email,
      })
      .then(res => _.map(res.orders, order => _.merge(order, { orderId: order.id })));
  }
}
