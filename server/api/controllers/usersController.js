/* eslint-disable object-curly-newline */
/**
   * User Controller
   * @param {object} db
   * @param {instance} user
   */
export default class {
  constructor(db, user, auth) {
    this.db = db;
    this.user = user;
    this.auth = auth;
  }

  /**
     * Create A User
     * @param {object} req
     * @returns {object} user object
     */
  async create(req) {
    const {
      email, username, password, phone, address,
    } = req.body;
    if (!username || !email || !password) {
      return { status: 'fail', statusCode: 400, message: 'Please input username, email and password' };
    }
    if (!username || username.toString().startsWith('0') || typeof username !== 'string' || username.trim().length === 0) {
      return { status: 'fail', statusCode: 400, message: 'Please input valid username' };
    }

    this.user.email = email.trim().toLowerCase();
    this.user.username = username.trim().toLowerCase();
    this.user.password = password;

    if (!this.user.isValidEmail()) {
      return { status: 'fail', statusCode: 400, message: 'Please enter a valid email address' };
    }
    if (this.user.isValidPassword() !== 'true') {
      return { status: 'fail', statusCode: 400, message: this.user.isValidPassword() };
    }
    this.user.password = this.auth.hashPassword(this.user.password);
    this.user.phone = phone;
    this.user.address = address;
    this.user.createdDate = new Date();
    this.user.modifiedDate = new Date();

    const createQuery = `INSERT INTO
          users(username, email, password, phone, address, created_date, modified_date)
          VALUES($1, $2, $3, $4, $5, $6, $7)
          returning *`;
    const values = [
      this.user.username,
      this.user.email,
      this.user.password,
      this.user.phone,
      this.user.address,
      this.user.createdDate,
      this.user.modifiedDate,
    ];
    try {
      const { rows } = await this.db.query(createQuery, values);
      this.user.userId = rows[0].userid;
      const token = this.auth.generateToken(
        rows[0].userid, rows[0].username, rows[0].email, rows[0].role,
      );
      this.user.password = undefined;
      return {
        status: 'success', statusCode: 201, message: 'Signup successful', user: this.user, token,
      };
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        let message = '';
        if (error.detail.includes('username')) {
          message = `Username ${this.user.username} already exists`;
        }
        if (error.detail.includes('email')) {
          message = `Email address ${this.user.email} already exists`;
        }
        if (error.detail.includes('phone')) {
          message = `Phone number ${this.user.phone} already exists`;
        }
        return { status: 'fail', statusCode: 409, message };
      }
      return { status: 'fail', statusCode: 500, error: error.message };
    }
  }

  /**
    * Login
    * @param {object} req
    * @returns {object} user object
    */
  async login(req) {
    const { usernameEmail, password } = req.body;
    if ((!usernameEmail) || !password || Object.keys(req.body).length > 2) {
      return { status: 'fail', statusCode: 400, message: 'Please login with either (username or email) and password' };
    }
    if (usernameEmail) usernameEmail.trim().toLowerCase();
    const text = 'SELECT * FROM users WHERE email = $1 OR username = $1';
    try {
      const { rows } = await this.db.query(
        text, [usernameEmail.trim().toLowerCase()],
      );
      if (!rows[0] || !this.auth.comparePassword(password, rows[0].password)) {
        return { status: 'fail', statusCode: 400, message: 'The credentials you provided are incorrect' };
      }
      const { userid, username, email, role } = rows[0];
      const token = this.auth.generateToken(userid, username, email, role);
      rows[0].password = undefined;
      return {
        status: 'success', statusCode: 200, message: 'Login successful', user: rows[0], token,
      };
    } catch (error) {
      return { status: 'fail', statusCode: 500, error: error.message };
    }
  }

  /**
   * Get All orders/specific user
   * @param {object} request
   * @returns {object} orders
   */
  async findOrdersByUserId(req) {
    try {
      const getUserQuery = 'SELECT * FROM users WHERE userId = $1';
      const { rows } = await this.db.query(getUserQuery, [req.params.userId]);
      if (!rows[0]) {
        return { statusCode: 404, status: 'fail', message: 'User not found' };
      }
      const getAllOrdersQuery = 'SELECT * FROM orders WHERE userId = $1';
      const response = await this.db.query(getAllOrdersQuery, [req.params.userId]);
      const message = response.rowCount === 0 ? 'User has not made an order yet' : 'Orders retrieved successfully';
      return {
        statusCode: 200, status: 'success', message, orders: response.rows,
      };
    } catch (error) {
      return { statusCode: 500, status: 'fail', error: error.message };
    }
  }

  async read() {
    const getAllQuery = 'SELECT * FROM users';
    try {
      const { rows, rowCount } = await this.db.query(getAllQuery);
      return {
        status: 'success', statusCode: 200, message: `${rowCount} Users retrieved successfully`, users: rows, totalUsers: rowCount,
      };
    } catch (error) {
      return { status: 'fail', statusCode: 500, message: error.message };
    }
  }
}
