// import multer from 'multer';

// const upload = multer({ dest: '/uploads' });

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
    const { name, price } = req.body;
    let { img, genre, description } = req.body;

    if (!name || !name.trim()) {
      return { status: 'fail', statusCode: 400, message: 'Please enter the name of your food item' };
    }
    if (!price) {
      return { status: 'fail', statusCode: 400, message: 'Please enter the price of your food item' };
    }
    if (!genre || !genre.trim()) {
      return { status: 'fail', statusCode: 400, message: 'Please enter the genre of your food item' };
    }
    genre = genre.trim().toLowerCase();
    if (genre !== 'meal' && genre !== 'snack' && genre !== 'drink' && genre !== 'combo') {
      return { status: 'fail', statusCode: 400, message: 'Food genre must be either MEAL, SNACK, DRINK or COMBO' };
    }
    if (description) {
      description = description.trim();
    }

    try {
      img = req.file.path;
      const query = `INSERT INTO menu(name, price, genre, img, description, isAvailable, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      returning *`;

      const values = [
        name.trim().toUpperCase(),
        price,
        genre,
        img,
        description,
        true,
        new Date(),
        new Date(),
      ];
      const { rows } = await this.db.query(query, values);
      return {
        status: 'success', statusCode: 201, message: 'New food item added successfully!', product: rows[0],
      };
    } catch (error) {
      if (error.routine === 'pg_atoi') {
        return { status: 'fail', statusCode: 400, message: 'Please enter price in integer format' };
      }
      if (error.message === 'Cannot read property \'path\' of undefined') {
        return { status: 'fail', statusCode: 400, message: 'Please upload an image in jpg/jpeg or png format' };
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
      return {
        status: 'success', statusCode: 200, message: 'Menu items retrieved successfully', products: rows, productCount: rowCount,
      };
    } catch (error) {
      return { status: 'fail', statusCode: 500, message: error.message };
    }
  }
}
