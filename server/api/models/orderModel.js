// import uuidv1 from 'uuid/v1';


// Class orderModel represents order objects used with Data Structures - No database
export default class OrderModel {
  constructor(store) {
    this.store = store;
  }

  // Uncomment methods to test app using data structures
  // get all orders
  // getAll() {
  //   return new Promise((resolve, reject) => {
  //     if (this.store) resolve(this.store);
  //     else reject(this.store);
  //   });
  // }

  // get order from store based on id
  // get(id) {
  //   return new Promise((resolve, reject) => {
  //     this.store.forEach((order) => {
  //       if (order.orderId === id) {
  //         return resolve({
  //           orderId: id,
  //           found: true,
  //           value: order,
  //         });
  //       }
  //       return reject(id);
  //     });
  //     return reject(id);
  //   });
  // }

  // // save order in store
  // save(attrs) {
  //   return new Promise((resolve, reject) => {
  //     if (!attrs.body) {
  //       return reject(attrs.body);
  //     }
  //     const orderObj = attrs.body;

  //     // Reject if there's an existing ID
  //     this.store.forEach((order) => {
  //       if (orderObj.orderId === order.orderId) {
  //         return reject(orderObj.orderId);
  //       }
  //     });
  //     // Generate unique ID if order doesn't contain one
  //     if (!attrs.body.orderId) {
  //       orderObj.orderId = uuidv1();
  //     }
  //     // Assign orderId to order or a unique generated ID if there's none
  //     this.orderId = orderObj.orderId;

  //     // Add order to store
  //     this.store.push(orderObj);
  //     // return result to be rendered to browser
  //     return resolve({
  //       orderId: this.orderId,
  //       created: true,
  //       createdAt: Date(),
  //       updatedAt: Date(),
  //       order: orderObj,
  //     });
  //   });
  // }

  // // update an order of given id
  // update(attrs) {
  //   return new Promise((resolve, reject) => {
  //     this.store.forEach((order) => {
  //       if (order.orderId === attrs.orderId) {
  //         // Convert order to string before assigning to maintain original props of order
  //         // const orderStr = JSON.stringify(order);

  //         const newOd = Object.assign(order, attrs.body);

  //         return resolve({
  //           orderId: newOd.orderId,
  //           updated: true,
  //           updatedAt: Date(),
  //           // origOrder: JSON.parse(orderStr),
  //           newOrder: newOd,
  //         });
  //       }
  //     });
  //     // Reject if there's no matching orderId
  //     return reject(attrs.orderId);
  //   });
  // }

  // // delete an order from store
  // cancel(id) {
  //   return new Promise((resolve, reject) => {
  //     this.store.forEach((order) => {
  //       if (order.orderId === id) {
  //         const index = this.store.indexOf(order);
  //         this.store.splice(index, 1);
  //         return resolve({
  //           orderId: order.orderId,
  //           deleted: true,
  //         });
  //       }
  //     });
  //     // Reject if order isn't found
  //     return reject(id);
  //   });
  // }
  // End class
}
