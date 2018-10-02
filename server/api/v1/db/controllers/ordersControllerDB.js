
export default class OrderControllerDB {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get All orders/specific order
   * @param {number || undefined} id
   * @returns {object} orders array if id is undefined or order object otherwise
   */
  async read(req) {
    // console.log('REQUEST: ', req)
    let result = {};
    if (!req.params.orderId) {
      const getAllQuery = 'SELECT * FROM orders WHERE owner_id = $1';
      const { rows, rowCount } = await this.db.query(getAllQuery, [req.user.userId]);
      result = { rows, rowCount };
      console.log('resut is: ', result);
    } else {
      const getQuery = 'SELECT * FROM orders WHERE orderid = $1 AND owner_id = $2';
      const { rows } = await this.db.query(getQuery, [req.params.orderId, req.user.userId]);
      [result] = rows;
    }
    if (!result) {
      throw new Error(`order with id ${req.params.orderId} not found`);
    }
    return { message: 'order retrieved successfully', order: result };
  }

  /**
   * Create an order
   * @param {object} order
   * @returns {object} order object
   */
  async create(req) {
    console.log('req:', req.params, req.user);
    const query = `INSERT INTO orders(name, quantity, price, owner_id, userAddr, created_at, modified_at)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      returning *`;
    const values = [
      req.body.name,
      req.body.quantity,
      req.body.price,
      req.user.userId,
      req.body.userAddr,
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

  /**
   * Delete An Order
   * @param {object} id
   * @returns {void} return status code 204
   */
  async delete(req) {
    if (!req.params.orderId) {
      throw new Error('orderid not specified');
    }
    const deleteQuery = 'DELETE FROM orders WHERE orderId=$1 AND owner_id = $2 returning *';
    const { rows } = await this.db.query(deleteQuery, [req.params.orderId, req.user.userId]);
    if (!rows[0]) {
      throw new Error(`order with id ${req.params.orderId} not found`);
    }
    return { message: `order with id ${req.params.orderId} deleted successfully` };
  }
  // async delete(req, res) {
  //   const deleteQuery = 'DELETE FROM orders WHERE orderId=$1 returning *';
  //   try {
  //     const { rows } = await this.db.query(deleteQuery, [req.params.orderId]);
  //     if (!rows[0]) {
  //       return res.status(404).json({ message: 'order not found' });
  //     }
  //     return res.status(204).json({ message: 'deleted' });
  //   } catch (error) {
  //     return res.status(400).json(error);
  //   }
  // },
}
