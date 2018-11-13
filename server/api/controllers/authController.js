import jwt from 'jsonwebtoken';

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
      req.user = { userId: decoded.userId, username: decoded.username, email: decoded.email };
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
      req.user = { userId: decoded.userId, username: decoded.username, email: decoded.email };
      return next();
    } catch (error) {
      return res.status(500).json({ status: 'fail', statusCode: 400, message: error.message });
    }
  },
};

export default authController;
