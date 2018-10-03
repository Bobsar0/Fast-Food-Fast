import UserValidator from './userValidator';

export default class extends UserValidator {
  constructor(username, email, password, phone, address, rank) {
    super(email, password);
    this.username = username;
    this.phone = phone;
    this.address = address;
    this.rank = rank;
  }
}
