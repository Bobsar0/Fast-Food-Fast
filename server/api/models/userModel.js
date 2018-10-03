import UserValidator from './userValidator';

export default class extends UserValidator {
  constructor(attrs) {
    super(attrs.email, attrs.password);
    this.username = attrs.username;
    this.phone = attrs.phone;
    this.address = attrs.address;
    this.rank = attrs.rank;
  }
}
