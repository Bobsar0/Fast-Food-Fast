/* eslint-disable max-len */
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
    if (genre !== 'meal' && genre !== 'snack' && genre !== 'drink' && genre !== 'combo' && genre !== 'dessert') {
      return { status: 'fail', statusCode: 400, message: 'Food genre must be either MEAL, SNACK, DRINK, COMBO or DESSERT' };
    }
    if (description) {
      description = description.trim();
    }

    try {
      img = img || req.file.path;
      const query = `INSERT INTO menu(name, price, genre, img, description, isavailable, created_date, modified_date)
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
        status: 'success', statusCode: 201, message: `${rows[0].name} added successfully!`, product: rows[0],
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
        status: 'success', statusCode: 200, message: `${rowCount} Menu items retrieved successfully`, products: rows, count: rowCount,
      };
    } catch (error) {
      return { status: 'fail', statusCode: 500, message: error.message };
    }
  }

  /**
   * Update menu item
   * @param {object} req
   * @returns {object} menu object
   */
  async update(req) {
    try {
      const findOneQuery = 'SELECT * FROM menu WHERE foodid=$1';
      const { rows } = await this.db.query(findOneQuery, [req.params.foodId]);
      if (!rows[0]) {
        return ({ status: 'fail', statusCode: 404, message: `Food item with id ${req.params.foodId} not found on the menu` });
      }
      if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
        return ({ status: 'fail', statusCode: 400, message: 'Sorry, body content cannot be empty' });
      }
      const {
        price, genre, isAvailable,
      } = req.body;
      let { name, img, description } = req.body;

      if (name) { name = name.trim().toUpperCase(); }
      if (genre) {
        if (genre !== 'meal' && genre !== 'snack' && genre !== 'drink' && genre !== 'combo' && genre !== 'dessert') {
          return { status: 'fail', statusCode: 400, message: 'Food genre must be either MEAL, SNACK, DRINK, COMBO or DESSERT' };
        }
      }
      if (req.file) {
        img = req.file.path;
      }
      if (description) { description = description.trim(); }

      const updateQuery = `UPDATE menu
      SET name=$1, price=$2, genre=$3, img=$4, description=$5, isavailable=$6, modified_date=$7
      WHERE foodid=$8 returning *`;
      const values = [
        name || rows[0].name,
        price || rows[0].price,
        genre || rows[0].genre,
        img || rows[0].img,
        description || rows[0].description,
        isAvailable || rows[0].isavailable,
        new Date(),
        req.params.foodId,
      ];
      const response = await this.db.query(updateQuery, values);
      return {
        status: 'success', statusCode: 200, message: 'Food item edited successfully!', food: response.rows[0],
      };
    } catch (error) {
      return { status: 'fail', statusCode: 400, message: error.message };
    }
  }

  async delete(req) {
    const findOneQuery = 'SELECT * FROM menu WHERE foodid=$1';
    const { foodId } = req.params;
    let result = {};
    try {
      const { rows } = await this.db.query(findOneQuery, [foodId]);
      if (!rows[0]) {
        return { status: 'fail', statusCode: 404, message: `Food item with id ${foodId} not found on the menu` };
      }
      const deleteQuery = 'DELETE FROM menu WHERE foodid=$1';
      const response = await this.db.query(deleteQuery, [foodId]);
      if (response.rows.length === 0 && response.rowCount === 1) {
        result = { status: 'success', statusCode: 200, message: `${rows[0].name} ID ${foodId} deleted successfully` };
      }
      return result;
    } catch (error) {
      return { status: 'fail', statusCode: 400, message: error.message };
    }
  }
}
