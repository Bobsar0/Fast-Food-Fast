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
      this.userId = rows[0].userid;
      const token = this.user.generateToken(this.userId);
      return { status: 201, token };
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return { status: 400, message: error.detail };
      }
      return { status: 400, error };
    }
  }

  /**
   * Login
   * @param {object} req
   * @returns {object} user object
   */
  async login(req) {
    if (!req.body.user || !req.body.password) {
      return { status: 400, message: 'Please input (username or email) and password' };
    }
    this.user.password = req.body.password;
    const text = 'SELECT * FROM users WHERE email = $1 OR username = $1';
    try {
      const { rows } = await this.db.query(text, [req.body.user]);
      if (!rows[0]) {
        return { status: 400, message: 'The credentials you provided are incorrect' };
      }
      if (!this.user.comparePassword(rows[0].password)) {
        return { status: 400, message: 'The credentials you provided are incorrect' };
      }
      const token = this.user.generateToken(rows[0].userid);
      return { status: 200, token };
    } catch (error) {
      return { status: 400, error };
    }
  }

  /**
   * Delete A User
   * @param {object} req
   * @returns {void} return status code 204
   */
  async delete(req) {
    const deleteQuery = 'DELETE FROM users WHERE userid=$1 returning *';
    try {
      const { rows } = await this.db.query(deleteQuery, [req.params.userId]);
      if (!rows[0]) {
        return { status: 404, message: 'user not found' };
      }
      return { status: 200, message: 'user deleted successfully' };
    } catch (error) {
      return { status: 400, error };
    }
  }
}

export default UsersController;
