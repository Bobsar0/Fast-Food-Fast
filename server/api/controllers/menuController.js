
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
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
      return { status: 'fail', statusCode: 400, message: 'Sorry, menu content cannot be empty' };
    }
    const { name, price, img } = req.body;
    let { genre } = req.body;

    if (!name || !name.trim()) {
      return { status: 'fail', statusCode: 400, message: 'Please enter the name of your menu item' };
    }
    if (!price) {
      return { status: 'fail', statusCode: 400, message: 'Please enter the price of your menu item' };
    }
    if (!genre || !genre.trim()) {
      return { status: 'fail', statusCode: 400, message: 'Please enter the genre of your menu item' };
    }
    genre = genre.trim().toUpperCase();
    if (genre !== 'MEAL' && genre !== 'SNACK' && genre !== 'DRINK' && genre !== 'COMBO') {
      return { status: 'fail', statusCode: 400, message: 'Food genre must be either MEAL, SNACK, DRINK or COMBO' };
    }
    if (!img || !img.trim()) {
      return { status: 'fail', statusCode: 400, message: 'Please enter an image url for your item' };
    }
    const query = `INSERT INTO menu(name, price, genre, img, isAvailable, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      returning *`;

    const values = [
      name.trim().toUpperCase(),
      price,
      genre,
      img,
      true,
      new Date(),
      new Date(),
    ];
    try {
      const { rows } = await this.db.query(query, values);
      return {
        status: 'success', statusCode: 201, message: 'New menu item added successfully', product: rows[0],
      };
    } catch (error) {
      if (error.routine === 'pg_atoi') {
        return { status: 'fail', statusCode: 400, message: 'Please enter price in integer format' };
      }
      return { status: 'fail', statusCode: 400, error: error.message };
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
