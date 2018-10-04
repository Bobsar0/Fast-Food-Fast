
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
    const query = `INSERT INTO orders(name, quantity, price, genre, status, userId, created_at, modified_at)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      returning *`;
    const order = { ...req.body };
    const values = [
      order.name,
      order.quantity,
      order.price,
      req.user.userId,
      new Date(),
      new Date(),
    ];
    try {
      const { rows } = await this.db.query(query, values);
      return { message: 'order created successfully', order: rows[0] };
    } catch (error) {
      return error;
    }
  }
}
