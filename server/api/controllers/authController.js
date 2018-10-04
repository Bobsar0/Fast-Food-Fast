import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import DB from '../models/dbModel';

dotenv.config();

let connectionString = '';

if (process.env.NODE_ENV === 'test') {
  connectionString = process.env.DB_URL_TEST;
} else {
  connectionString = process.env.DB_URL_LOCAL;
}
const pool = new Pool({
  connectionString,
});
const db = new DB(pool);
const authController = {
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
      return res.status(400).json({ status: 400, message: 'Token is not provided' });
    }
    try {
      const decoded = await jwt.verify(token, process.env.SECRET);
      const text = 'SELECT * FROM users WHERE userid = $1';
      const { rows } = await db.query(text, [decoded.userId]);
      if (!rows[0]) {
        return res.status(404).json({ status: 404, message: 'user not found' });
      }
      req.user = { userId: decoded.userId };
      return next();
    } catch (error) {
      return res.status(400).json({ status: 400, messsage: error.message });
    }
  },
  async verifyAdminToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is not provided' });
    }
    try {
      const decoded = await jwt.verify(token, process.env.SECRET);
      if (decoded.rank !== 'admin') {
        return res.status(404).json({ status: 404, message: 'only admins are authorized' });
      }
      const text = 'SELECT * FROM users WHERE userid = $1';
      const { rows } = await db.query(text, [decoded.userId]);
      if (!rows[0]) {
        return res.status(404).json({ status: 404, message: 'admin details not found' });
      }
      req.user = { userId: decoded.userId };
      return next();
    } catch (error) {
      return res.status(400).json({ status: 400, messsage: error.message });
    }
  },
};

export default authController;