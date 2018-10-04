
export default class OrderDBController {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create an order
   * @param {object} order
   * @returns {object} order object
   */
  async create(req) {
    const query = `INSERT INTO orders(name, quantity, price, genre, status, userid, created_at, modified_at)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      returning *`;
    const order = { ...req.body };
    const values = [
      order.name,
      order.quantity,
      order.price,
      order.genre,
      order.status,
      req.user.userId,
      new Date(),
      new Date(),
    ];
    try {
      const { rows } = await this.db.query(query, values);
      return { status: 201, message: 'Order created successfully', order: rows[0] };
    } catch (error) {
      return error.message;
    }
  }

  /**
   * Admin Get All orders or specific order
   * @param {number || undefined} id
   * @returns {object} orders array if id is undefined or order object otherwise
   */
  async read(req) {
    let result = {};
    if (!req) {
      const getAllQuery = 'SELECT * FROM orders';
      const { rows, rowCount } = await this.db.query(getAllQuery);
      result = { rows, rowCount };
    } else {
      const getQuery = 'SELECT * FROM orders WHERE orderid = $1';
      const { rows } = await this.db.query(getQuery, [req.params.orderId]);
      [result] = rows;
    }
    if (!result) {
      throw new Error(`Order with id ${req.params.orderId} not found`);
    }
    return { message: 'Orders retrieved successfully', order: result };
  }

  /**
   * Update An Order
   * @param {number} id
   * @param {object} attrs
   * @returns {object} updated order
   */
  async updateStatus(req) {
    const findOneQuery = 'SELECT * FROM orders WHERE orderId=$1';
    const { rows } = await this.db.query(findOneQuery, [req.params.orderId]);
    if (!rows[0]) {
      throw new Error(`Order with id ${req.params.orderId} not found`);
    }
    const updateStatusQuery = `UPDATE orders
      SET status=$1, modified_at= $2
      WHERE orderid=$3 returning *`;

    const status = req.body.status.toUpperCase();

    if (!status) {
      return ({ status: 400, message: 'Please update order status' });
    }
    if (Object.keys(req.body).length > 1) {
      return ({ status: 400, message: 'Please update only order status' });
    }
    if (status !== 'NEW' && status !== 'PROCESSING' && status !== 'CANCELLED' && status !== 'COMPLETE') {
      return ({ status: 400, message: ' Status can only be New, Processing, Cancelled or Complete' });
    }
    if (status === rows[0].status) {
      return ({ status: 200, message: 'Order status was not modified', order: rows[0] });
    }
    const values = [
      status.toUpperCase(),
      new Date(),
      req.params.orderId,
    ];
    try {
      const response = await this.db.query(updateStatusQuery, values);
      return { status: 200, message: 'Status updated successfully', order: response.rows[0] };
    } catch (error) {
      return error.message;
    }
  }
}
