import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default class {
  constructor(password) {
    this.password = password;
  }

  /**
   * Hash Password Method
   * @returns {string} hashed password
   */

  hashPassword(password) {
    this.password = password;
    return bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
  }

  /**
   * comparePassword
   * @param {string} hashedPassword
   * @returns {Boolean} True or False
   */
  comparePassword(password, hashedDBPassword) {
    this.password = password;
    return bcrypt.compareSync(this.password, hashedDBPassword);
  }

  /**
   * Generate Token
   * @param {string} id
   * @returns {string} token
   */
  generateToken(id, role) {
    this.token = jwt.sign({ userId: id, role }, process.env.SECRET, { expiresIn: '2d' });
    return this.token;
  }
}
