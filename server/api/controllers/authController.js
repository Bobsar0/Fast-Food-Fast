import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import DB from '../models/dbModel';


let connectionString = '';

if (process.env.NODE_ENV === 'test') {
  connectionString = 'postgres://cfsezloo:oA41pLZTXNtBIR_vxJHO-ZXqwHM0lAzR@tantor.db.elephantsql.com:5432/cfsezloo';
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
      return res.status(401).json({ error: { status: 'fail', statusCode: 401, message: 'Token is not provided' } });
    }
    try {
      const decoded = await jwt.verify(token, 'fastFoodFast');
      const text = 'SELECT * FROM users WHERE userid = $1';
      const { rows } = await db.query(text, [decoded.userId]);
      if (!rows[0]) {
        return res.status(404).json({ error: { status: 'fail', statusCode: 404, message: 'User not found' } });
      }
      req.user = { userId: decoded.userId };
      return next();
    } catch (error) {
      return res.status(500).json({ error: { status: 'fail', statusCode: 500, message: error.message } });
    }
  },

  async verifyAdminToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(401).json({ status: 'fail', statusCode: 401, message: 'Please provide a token' });
    }
    try {
      const decoded = await jwt.verify(token, 'fastFoodFast');

      if (decoded.role !== 'admin') {
        return res.status(403).json({ status: 'fail', statusCode: 403, message: 'Sorry, only admins are authorized' });
      }
      const text = `SELECT * FROM users WHERE userid = ${decoded.userId}`;
      const { rows } = await db.query(text);
      if (!rows[0]) {
        return res.status(404).json({ status: 'fail', statusCode: 404, message: 'Admin details not found' });
      }
      req.user = { userId: decoded.userId };
      return next();
    } catch (error) {
      return res.status(500).json({ status: 'fail', statusCode: 400, message: error.message });
    }
  },
};

export default authController;
