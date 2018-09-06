export default class {
  constructor(user) {
    this.user = user;
  }

  index() {
    // controller returns an empty object
    return new this.Promise(resolve => resolve({}));
  }
}
