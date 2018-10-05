import UserValidator from './userValidator';

export default class extends UserValidator {
  constructor(username, email, password, phone, address, role) {
    super(email, password);
    this.username = username;
    this.phone = phone;
    this.address = address;
    this.role = role;
  }
}
