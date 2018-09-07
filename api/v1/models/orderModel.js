import { uuid } from 'uuid/v1';
import BaseModel from './baseModel';

class Order extends BaseModel {
  constructor(attrs, username, userAddr, userRank) {
    super(username, userAddr, userRank);
    this.name = attrs.name;
    this.price = attrs.price;
    this.quantity = 0;
    this.store = [];
    this.attrs = attrs;
  }

  get orderId() {
    this.orderId = uuid();
    return this.attrs.orderId;
  }

  //  searches the entire store and returns everything
  search(store) {
    if (store !== this.store) {
      return false;
    }
    return store;
  }

  // saves order in store
  save(store, attrs) {
    this.store.push(attrs);
  }

  // gets order from store based on id
  get(store, id) {
    this.store.forEach((order) => {
      if (order.orderId === id) {
        return order[id];
      }
    });
  }

  // updates an order of given id
  update(store, id, attrs) {
    this.store.forEach((order) => {
      if (order.orderId === id) {
        Object.assign((attrs), order);
      }
      return order.orderId;
    });
  }

  // deletes an order from store
  delete(id) {
    this.store.forEach((order) => {
      if (order.orderId === id) {
        const index = this.store.indexOf(order);
        // call splice() if indexOf() didn't return -1:
        if (index !== -1) {
          this.store.splice(index, 1);
        }
        return order.orderId;
      }
    });
  }
}

export default Order;
