
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
      return { message: 'order created successfully', order: rows[0] };
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
      throw new Error(`order with id ${req.params.orderId} not found`);
    }
    return { message: 'orders retrieved successfully', order: result };
  }
}
