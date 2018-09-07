import bcrypt from 'bcrypt';
import BaseModel from './baseModel';

class User extends BaseModel {
  constructor(username, userAddr, userRank, email, phone) {
    super(username, userAddr, userRank);
    this.email = email;
    this.phone = phone;
  }

  get hashedPassword() {
    if (this.password === 0) {
      return undefined;
    }
    return bcrypt.hash(this.password, 10, (err, hash) => hash);
  }
}

export default User;
