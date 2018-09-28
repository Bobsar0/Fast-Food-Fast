import uuidv4 from 'uuid/v4';
import db from '../../db';

const OrderC = {
  /**
   * Create an order
   * @param {object} order
   * @returns {object} order object
   */
  async create(order) {
    const date = new Date();
    const query = `INSERT INTO
      orders(orderId, name, quantity, price, userAddr, created_at, modified_at)
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;
    const values = [
      uuidv4(),
      order.orderId,
      order.name,
      order.quantity,
      order.price,
      order.userAddr,
      date.getTime(),
      date.getTime(),
    ];
    const { rows } = await db.query(query, values);
    return new Promise((resolve) => {
      resolve(rows[0]);
    });
  },
  /**
   * Get All order
   * @param {number || undefined} id
   * @returns {object} orders array if id is undefined or order object otherwise
   */
  // async read(req, res) {
  //   const findAllQuery = 'SELECT * FROM orders';
  //   try {
  //     const { rows, rowCount } = await db.query(findAllQuery);
  //     return res.status(200).json({ rows, rowCount });
  //   } catch (error) {
  //     return res.status(400).json(error);
  //   }
  // },
  async read(id = '') {
    let result = {};
    if (id === '') {
      const getAllQuery = 'SELECT * FROM orders';
      const { rows, rowCount } = await db.query(getAllQuery);
      result = { rows, rowCount };
    } else {
      const getQuery = 'SELECT * FROM orders WHERE orderId = $1';
      const { rows } = await db.query(getQuery, [id]);
      result = { rows };
    }
    return new Promise((resolve, reject) => {
      if (id === '') {
        return resolve(result);
      }
      if (!result[0]) {
        return reject(id);
      }
      return resolve(result[0]);
    });
  },

  // async read(id) {
  //   return Promise((resolve, reject) => {
  //     const query = 'SELECT * FROM orders WHERE orderId = $1';
  //     const { rows } = await db.query(query, [id]);
  //     if (!rows[0]) {
  //       return reject(err)
  //     }
  //     return resolve(rows[0]);
  //   })
  // },
  // async get(req, res) {
  //   const text = 'SELECT * FROM orders WHERE orderId = $1';
  //   try {
  //     const { rows } = await db.query(text, [req.params.orderId]);
  //     if (!rows[0]) {
  //       return res.status(404).json({ message: 'order does not exist' });
  //     }
  //     return res.status(200).json(rows[0]);
  //   } catch (error) {
  //     return res.status(400).json(error);
  //   }
  // },
  /**
   * Update An Order
   * @param {number} id
   * @param {object} attrs
   * @returns {object} updated order
   */
  async update(id, attrs) {
    const findOneQuery = 'SELECT * FROM orders WHERE orderId=$1';
    const updateOneQuery = `UPDATE orders
      SET name=$1, quantity=$2, price=$3, userAddr=$4, modified_at= $5
      WHERE orderId=$6 returning *`;
    const { rows } = await db.query(findOneQuery, [id]);
    return new Promise((resolve, reject) => {
      if (!rows[0]) {
        return reject(attrs);
      }
      const date = new Date();
      const values = [
        attrs.name || rows[0].name,
        attrs.quantity || rows[0].quantity,
        attrs.price || rows[0].price,
        attrs.userAddr || rows[0].userAddr,
        date.getTime(),
        id,
      ];
      const response = db.query(updateOneQuery, values);
      return resolve(response.rows[0]);
    });
  },
  // async update(req, res) {
  //   const findOneQuery = 'SELECT * FROM orders WHERE orderId=$1';
  //   const updateOneQuery = `UPDATE orders
  //     SET name=$1, quantity=$2, price=$3, userAddr=$4, modified_at= $5
  //     WHERE orderId=$6 returning *`;
  //   try {
  //     const { rows } = await db.query(findOneQuery, [req.params.orderId]);
  //     if (!rows[0]) {
  //       return res.status(404).json({ message: 'order not found' });
  //     }
  //     const date = new Date();
  //     const values = [
  //       req.body.name || rows[0].name,
  //       req.body.quantity || rows[0].quantity,
  //       req.body.price || rows[0].price,
  //       req.body.userAddr || rows[0].userAddr,
  //       date.getTime(),
  //       req.params.orderId,
  //     ];
  //     const response = await db.query(updateOneQuery, values);
  //     return res.status(200).json(response.rows[0]);
  //   } catch (err) {
  //     return res.status(400).json(err);
  //   }
  // },
  /**
   * Delete An Order
   * @param {object} id
   * @returns {void} return statuc code 204
   */
  async delete(id) {
    const deleteQuery = 'DELETE FROM orders WHERE orderId=$1 returning *';
    const { rows } = await db.query(deleteQuery, [id]);
    return new Promise((resolve, reject) => {
      if (!rows[0]) {
        return reject(id);
      }
      return resolve({ message: 'order deleted successfully' });
    });
  },
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
};

export default OrderC;
