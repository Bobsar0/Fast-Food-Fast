import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Adapted from https://www.codementor.io/olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-postgresql-db-and-jwt-3-mke10c5c5
export default class Validator {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  /**
   * isValidEmail helper method
   * @param {string} email
   * @returns {Boolean} True or False
   */
  isValidEmail() {
    return /\S+@\S+\.\S+/.test(this.email);
  }

  /**
   * isValidPassword method
   * @param {string} password
   * @returns {string} true or error messages
   */
  // Adapted from https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
  isValidPassword() {
    if (!/[a-z]/.test(this.password)) {
      return 'Your password must contain at least one lowercase letter';
    } if (!/[A-Z]/.test(this.password)) {
      return 'Your password must contain at least one Uppercase letter';
    } if (!/\d/.test(this.password)) {
      return 'Your password must contain at least one number';
    } if (!/[@$!%*?&]/.test(this.password)) {
      return 'Your password must contain at least one of these special characters: @, $, !, %, *, ?, &';
    } if (this.password.length < 6) {
      return 'Your password must be composed of at least 6 characters';
    }
    return 'true';
  }

  /**
   * Hash Password Method
   * @returns {string} returns hashed password
   */
  get hashedPassword() {
    return bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
  }

  /**
   * comparePassword
   * @param {string} hashedPassword
   * @returns {Boolean} True or False
   */
  comparePassword(hashedPassword) {
    return bcrypt.compareSync(this.password, hashedPassword);
  }

  /**
   * Generate Token
   * @param {string} id
   * @returns {string} token
   */
  generateToken(id) {
    this.token = jwt.sign({ userId: id }, process.env.SECRET, { expiresIn: '7d' });
    return this.token;
  }
}
