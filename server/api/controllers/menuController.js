
export default class {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get All menu
   * @param {object} req
   * @returns {object} order object
   */
  async readMenu() {
    const getAllQuery = 'SELECT * FROM menu';
    try {
      const { rows, rowCount } = await this.db.query(getAllQuery);
      return { message: 'Menu retrieved successfully', menu: { rows, rowCount } };
    } catch (error) {
      return error.message;
    }
  }
}
