import Validator from '../validator';

export default class extends Validator {
  constructor(username, email, phone, password, address, rank = 'anonymous') {
    super(email, password);
    this.username = username;
    this.phone = phone;
    this.address = address;
    this.rank = rank;
  }
}
