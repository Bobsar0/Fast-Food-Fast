import { uuid } from 'uuid/v1';
import BaseModel from './baseModel';

class Order extends BaseModel {
  constructor(name, price, username, userAddr, userRank) {
    super(username, userAddr, userRank);
    this.name = name;
    this.price = price;
  }

  get orderId() {
    this.orderId = uuid();
    return this.orderId;
  }
}

export default Order;
