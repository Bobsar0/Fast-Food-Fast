export default class {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  /**
   * isValidEmail helper method
   * @param {string} email
   * @returns {Boolean} True or False
   */
  // Adapted from https://www.codementor.io/olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-postgresql-db-and-jwt-3-mke10c5c5
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
      return 'Your password must contain at least one uppercase letter';
    } if (!/\d/.test(this.password)) {
      return 'Your password must contain at least one number';
    } if (!/[@$!%*?&]/.test(this.password)) {
      return 'Your password must contain at least one of these special characters: @, $, !, %, *, ?, &';
    } if (this.password.length < 6) {
      return 'Your password must be composed of at least 6 characters';
    }
    return 'true';
  }
}
