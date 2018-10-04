
export default class {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a menu
   * @param {object} menu
   * @returns {object} menu object
   */
  async create(req) {
    const query = `INSERT INTO menu(name, price, genre, isAvailable, created_at, modified_at)
      VALUES($1, $2, $3, $4, $5, $6,)
      returning *`;
    const order = { ...req.body };
    const values = [
      order.name,
      order.price,
      order.genre,
      order.isAvailable,
      new Date(),
      new Date(),
    ];
    try {
      const { rows } = await this.db.query(query, values);
      return { status: 201, message: 'Menu created successfully', order: rows[0] };
    } catch (error) {
      return error.message;
    }
  }

  /**
   * Get All menu
   * @param {object} req
   * @returns {object} menu object
   */
  async read() {
    const getAllQuery = 'SELECT * FROM menu';
    try {
      const { rows, rowCount } = await this.db.query(getAllQuery);
      return { message: 'Menu retrieved successfully', menu: { rows, rowCount } };
    } catch (error) {
      return error.message;
    }
  }
}
