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
    const { email, username, password } = req.body;
    if (!username || !email || !password) {
      return { status: 400, message: 'Please input username, email and password' };
    }
    if (!username) {
      return { status: 400, message: 'Please input username' };
    }
    if (!email) {
      return { status: 400, message: 'Please input email' };
    }
    if (!password) {
      return { status: 400, message: 'Please input password' };
    }
    this.user = Object.assign(this.user, req.body);

    if (!this.user.isValidEmail()) {
      return { status: 400, message: 'Please enter a valid email address' };
    }
    if (this.user.isValidPassword() !== 'true') {
      return { status: 400, message: this.user.isValidPassword() };
    }
    this.user.password = this.auth.hashPassword(this.user.password);

    const createQuery = `INSERT INTO
          users(username, email, password, phone, address, rank, created_date, modified_date)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8)
          returning *`;
    const values = [
      this.user.username,
      this.user.email,
      this.user.password,
      this.user.phone,
      this.user.address,
      this.user.rank,
      new Date(),
      new Date(),
    ];
    try {
      const { rows } = await this.db.query(createQuery, values);
      this.user.userId = rows[0].userid;
      const token = this.auth.generateToken(rows[0].userid, rows[0].rank);
      return {
        status: 201, message: 'signup successful', user: this.user, token,
      };
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return { status: 409, message: error.detail };
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
    const { email, username, password } = req.body;
    if ((!username && !email) || !password) {
      return { status: 400, message: 'Please input (username or email) and password' };
    }
    const text = 'SELECT * FROM users WHERE email = $1 OR username = $1';
    try {
      const { rows } = await this.db.query(text, [username || email]);
      if (!rows[0] || !this.auth.comparePassword(password, rows[0].password)) {
        return { status: 400, message: 'The credentials you provided are incorrect' };
      }
      const token = this.auth.generateToken(rows[0].userid, rows[0].rank);
      return { status: 200, message: 'login successful', token };
    } catch (error) {
      return { error };
    }
  }
}
