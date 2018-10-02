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
}
