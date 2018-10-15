
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
    // The line below was adapted from this source: https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
      return { status: 'fail', statusCode: 400, message: 'Sorry, order content cannot be empty' };
    }
    const { name, quantity } = req.body;
    if (!name || !name.trim() || typeof name !== 'string') {
      return { status: 'fail', statusCode: 400, message: 'Please enter the name of your order' };
    }
    if (!quantity) {
      return { status: 'fail', statusCode: 400, message: 'Please enter the quantity of your order' };
    }
    const itemName = name.trim().toUpperCase();
    try {
      const menuQuery = 'SELECT * from menu WHERE name = $1';
      const response = await this.db.query(menuQuery, [itemName]);
      if (response.rows.length === 0) {
        return { status: 'fail', statusCode: 404, message: `Sorry, ${name} is not available on the menu` };
      }
      const totalPrice = Number(response.rows[0].price) * Number(quantity);
      const query = `INSERT INTO orders(name, quantity, price, status, userid, created_date, modified_date)
        VALUES($1, $2, $3, $4, $5, $6, $7)
        returning *`;
      const values = [
        itemName,
        quantity,
        totalPrice,
        'NEW',
        req.user.userId,
        new Date(),
        new Date(),
      ];

      const { rows } = await this.db.query(query, values);
      return {
        status: 'success', statusCode: 201, message: 'Order created successfully', order: rows[0],
      };
    } catch (error) {
      if (error.routine === 'pg_atoi') {
        return { status: 'fail', statusCode: 400, message: 'Please enter quantity in integer format' };
      }
      return { status: 'fail', statusCode: 500, message: error.message };
    }
  }

  /**
   * Admin Get All orders or specific order
   * @param {number || undefined} id
   * @returns {object} orders array if id is undefined or order object otherwise
   */
  async read(req) {
    let data = {};
    let message = '';
    if (!req) {
      const getAllQuery = 'SELECT * FROM orders';
      const { rows, rowCount } = await this.db.query(getAllQuery);
      data = { orders: rows, totalOrders: rowCount };
      message = 'Orders retrieved successfully';
    } else {
      const getQuery = 'SELECT * FROM orders WHERE orderid = $1';
      const { rows } = await this.db.query(getQuery, [req.params.orderId]);
      [data] = rows;
      if (!data) {
        throw new Error(`Order with id ${req.params.orderId} not found`);
      }
      message = 'Order retrieved successfully';
    }
    return {
      status: 'success', statusCode: 200, message, data,
    };
  }

  /**
   * Update An Order
   * @param {number} id
   * @param {object} attrs
   * @returns {object} updated order
   */
  async updateStatus(req) {
    const findOneQuery = 'SELECT * FROM orders WHERE orderId=$1';
    const { rows } = await this.db.query(findOneQuery, [req.params.orderId]);
    if (!rows[0]) {
      return ({ status: 'fail', statusCode: 404, message: `Order with id ${req.params.orderId} not found` });
    }
    const updateStatusQuery = `UPDATE orders
      SET status=$1, modified_date= $2
      WHERE orderid=$3 returning *`;

    let { status } = req.body;

    if (!status || !status.trim()) {
      return ({ status: 'fail', statusCode: 400, message: 'Please update order status' });
    }
    status = status.trim().toUpperCase();

    if (Object.keys(req.body).length > 1) {
      return ({ status: 'fail', statusCode: 400, message: 'Please update only order status' });
    }
    if (status !== 'NEW' && status !== 'PROCESSING' && status !== 'CANCELLED' && status !== 'COMPLETE') {
      return ({ status: 'fail', statusCode: 400, message: 'Status can only be updated to NEW, PROCESSING, CANCELLED or COMPLETE' });
    }
    if (status === rows[0].status) {
      return ({
        status: 'success', statusCode: 200, message: 'Order status was not modified', order: rows[0],
      });
    }
    const values = [
      status,
      new Date(),
      req.params.orderId,
    ];
    try {
      const response = await this.db.query(updateStatusQuery, values);
      return {
        status: 'success', statusCode: 200, message: 'Status updated successfully', order: response.rows[0],
      };
    } catch (error) {
      return { message: error.message };
    }
  }
}
