export default class {
  index() {
    // We can assume that controller will return some kind of promise
    // because it will make requests to ES that are asynchronous
    return new this.Promise((resolve, reject) => resolve({}));
  }
}
