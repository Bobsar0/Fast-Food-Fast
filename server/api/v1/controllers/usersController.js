/**
   * User Controller
   * @param {object} db
   * @param {instance} Usermodel
   */
class UsersController {
  constructor(db, userModel) {
    this.db = db;
    this.user = userModel;
  }

  /**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */
  async create(req) {
    if (!req.body.username || !req.body.email || !req.body.password) {
      return { status: 400, message: 'Please input username, email and password' };
    }
    if (!req.body.username) {
      return { status: 400, message: 'Please input username' };
    }
    if (!req.body.email) {
      return { status: 400, message: 'Please input email' };
    }
    if (!req.body.password) {
      return { status: 400, message: 'Please input password' };
    }
    this.user.username = req.body.username;
    this.user.email = req.body.email;
    this.user.password = req.body.password;
    if (!this.user.isValidEmail()) {
      return { status: 400, message: 'Please enter a valid email address' };
    }
    if (this.user.isValidPassword() !== 'true') {
      return { status: 400, message: this.user.isValidPassword() };
    }

    const createQuery = `INSERT INTO
      users(username, email, password, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5)
      returning *`;
    const values = [
      this.user.username,
      this.user.email,
      this.user.hashedPassword,
      new Date(),
      new Date()];

    try {
      const { rows } = await this.db.query(createQuery, values);
      const token = this.user.generateToken(rows[0].userid);
      return { status: 201, token };
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return { status: 400, message: error.detail };
      }
      return { status: 400, error };
    }
  }
}

export default UsersController;
