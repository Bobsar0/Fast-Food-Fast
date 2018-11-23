export default class {
  constructor(client) {
    this.orders = client;
  }

  // GET /orders/:orderId
  // read implements getAll() to return all orders or get() to return an order based on its id
  // Error is caught on server
  read(id = '') {
    if (id === '') {
      return this.orders.getAll()
        .then(store => store.map(order => (order)));
    }
    return this.orders.get(id)
      .then(res => new Promise((resolve, reject) => {
        if (res.found) {
          return resolve(res.value);
        }
        return reject(id);
      }))
      .catch(orderId => ({ status: 404, error: `Invalid order Id ${orderId}` }));
  }

  // POST /orders
  // create makes a new order and returns orderId merged with order if successful
  create(order) {
    return this.orders.save({
      body: order,
    }) // Merge the results obtained from save() which will be rendered by server
      .then(res => (res));
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
          return resolve(res);
        }
        return reject(attrs);
      }))
      .catch(resId => ({ status: '404', error: `Order of ID ${resId} does not exist` }));
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
      .catch(resId => ({ status: '404', error: `Order of ID ${resId} does not exist` }));
  }
}
