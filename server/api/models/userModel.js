import UserValidator from './userValidator';

export default class extends UserValidator {
  constructor(username, email, phone, password, address, rank) {
    super(email, password);
    this.username = username;
    this.phone = phone;
    this.address = address;
    this.rank = rank;
  }
}
