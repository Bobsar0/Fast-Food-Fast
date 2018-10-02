import jwt from 'jsonwebtoken';

export default class {
  constructor(db) {
    this.db = db;
  }

  // Adapted from https://www.codementor.io/olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-postgresql-db-and-jwt-3-mke10c5c5
  /**
   * Verify Token
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @returns {object|void} response object
   */
  async verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(400).json({ message: 'Token is not provided' });
    }
    const decoded = await jwt.verify(token, process.env.SECRET);
    console.log('db:', this.db);

    console.log('decoded:', decoded);

    const text = 'SELECT * FROM users WHERE userid = $1';
    const { rows } = await this.db.query(text, [decoded.userId]);
    console.log('rows::', rows);
    if (!rows[0]) {
      return res.status(400).json({ message: 'The token you provided is invalid' });
    }
    req.user = { userId: decoded.userId };
    return next();
  }
}
