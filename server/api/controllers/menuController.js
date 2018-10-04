
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
    const query = `INSERT INTO menu(name, price, genre, img, isAvailable, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      returning *`;
    const menu = { ...req.body };
    const genre = menu.genre.toUpperCase();
    if (genre !== 'MEAL' && genre !== 'SNACKS' && genre !== 'DRINKS' && genre !== 'COMBO') {
      return { status: 400, message: 'Food genre must be either MEAL, SNACKS, DRINKS or COMBO' };
    }
    const values = [
      menu.name,
      menu.price,
      genre,
      menu.img,
      menu.isAvailable,
      new Date(),
      new Date(),
    ];
    try {
      const { rows } = await this.db.query(query, values);
      return { status: 201, message: 'Menu created successfully', menu: rows[0] };
    } catch (error) {
      return { status: 500, error: error.message };
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
