
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

  /**
   * Update An Order
   * @param {number} id
   * @param {object} attrs
   * @returns {object} updated order
   */
  async update(req) {
    const findOneQuery = 'SELECT * FROM orders WHERE orderId=$1 AND owner_id = $2';
    const { rows } = await this.db.query(findOneQuery, [req.params.orderId, req.user.userId]);
    if (rows.length === 0) {
      throw new Error(`Order with id ${req.params.orderId} not found`);
    }
    const updateOneQuery = `UPDATE orders
      SET name=$1, quantity=$2, price=$3, userAddr=$4, modified_at= $5
      WHERE orderid=$6 AND owner_id = $7 returning *`;

    const values = [
      req.body.name || rows[0].name,
      req.body.quantity || rows[0].quantity,
      req.body.price || rows[0].price,
      req.body.userAddr || rows[0].userAddr,
      new Date(),
      req.params.orderId,
      req.user.userId,
    ];
    const response = await this.db.query(updateOneQuery, values);
    return { message: 'order updated successfully', order: response.rows[0] };
  }
}
