import db from '../index';

export default class OrderControllerDB {
  /**
   * Get All orders/specific order
   * @param {number || undefined} id
   * @returns {object} orders array if id is undefined or order object otherwise
   */
  static async read(id = '') {
    let result = {};
    if (id === '') {
      const getAllQuery = 'SELECT * FROM orders';
      const { rows, rowCount } = await db.query(getAllQuery);
      result = { rows, rowCount };
    } else {
      const getQuery = 'SELECT * FROM orders WHERE orderid = $1';
      const { rows } = await db.query(getQuery, [id]);
      [result] = rows;
    }
    if (!result) {
      throw new Error(`order with id ${id} not found`);
    }
    return { message: 'order retrieved successfully', order: result };
  }

  /**
   * Create an order
   * @param {object} order
   * @returns {object} order object
   */
  static async create(order) {
    const query = `INSERT INTO orders(name, quantity, price, userAddr, created_at, modified_at)
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;
    const values = [
      order.name,
      order.quantity,
      order.price,
      order.userAddr,
      new Date(),
      new Date(),
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  /**
   * Update An Order
   * @param {number} id
   * @param {object} attrs
   * @returns {object} updated order
   */
  static async update(id, attrs) {
    const findOneQuery = 'SELECT * FROM orders WHERE orderId=$1';
    const { rows } = await db.query(findOneQuery, [id]);
    if (rows.length === 0) {
      throw new Error(`Order with id ${id} not found`);
    }
    const updateOneQuery = `UPDATE orders
      SET name=$1, quantity=$2, price=$3, userAddr=$4, modified_at= $5
      WHERE orderid=$6 returning *`;

    const values = [
      attrs.name || rows[0].name,
      attrs.quantity || rows[0].quantity,
      attrs.price || rows[0].price,
      attrs.userAddr || rows[0].userAddr,
      new Date(),
      id,
    ];
    const response = await db.query(updateOneQuery, values);
    return response.rows[0];
  }

  /**
   * Delete An Order
   * @param {object} id
   * @returns {void} return status code 204
   */
  static async delete(id) {
    if (!id) {
      throw new Error('orderid not specified');
    }
    const deleteQuery = 'DELETE FROM orders WHERE orderId=$1 returning *';
    const { rows } = await db.query(deleteQuery, [id]);
    if (!rows[0]) {
      throw new Error(`order with id ${id} not found`);
    }
    return { message: `order with id ${id} deleted successfully` };
  }
  // async delete(req, res) {
  //   const deleteQuery = 'DELETE FROM orders WHERE orderId=$1 returning *';
  //   try {
  //     const { rows } = await db.query(deleteQuery, [req.params.orderId]);
  //     if (!rows[0]) {
  //       return res.status(404).json({ message: 'order not found' });
  //     }
  //     return res.status(204).json({ message: 'deleted' });
  //   } catch (error) {
  //     return res.status(400).json(error);
  //   }
  // },
}
